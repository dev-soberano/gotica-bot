import { readFileSync, writeFileSync, existsSync } from "fs";

// Importação dinâmica compatível com ESM
const { 
    initAuthCreds, 
    BufferJSON, 
    proto 
} = (await import("@whiskeysockets/baileys")).default;

function bind(conn) {
    if (!conn.chats) conn.chats = {};

    function updateNameToDb(contacts) {
        if (!contacts) return;
        try {
            contacts = contacts.contacts || contacts;
            for (const contact of contacts) {
                const id = conn.decodeJid(contact.id);
                if (!id || id === "status@broadcast") continue;
                let chats = conn.chats[id];
                if (!chats)
                    chats = conn.chats[id] = {
                        ...contact,
                        id: id,
                    };
                conn.chats[id] = {
                    ...chats,
                    ...({
                        ...contact,
                        id: id,
                        ...(id.endsWith("@g.us")
                            ? {
                                subject: contact.subject || contact.name || chats.subject || "",
                            }
                            : {
                                name: contact.notify || contact.name || chats.name || chats.notify || "",
                            }),
                    } || {}),
                };
            }
        } catch (e) {
            console.error("Erro ao atualizar nome no DB:", e);
        }
    }

    conn.ev.on("contacts.upsert", updateNameToDb);
    conn.ev.on("groups.update", updateNameToDb);
    conn.ev.on("contacts.set", updateNameToDb);
    
    conn.ev.on("chats.set", async ({ chats }) => {
        try {
            for (let { id, name, readOnly } of chats) {
                id = conn.decodeJid(id);
                if (!id || id === "status@broadcast") continue;
                const isGroup = id.endsWith("@g.us");
                let chatObj = conn.chats[id];
                if (!chatObj)
                    chatObj = conn.chats[id] = { id: id };
                
                chatObj.isChats = !readOnly;
                if (name) chatObj[isGroup ? "subject" : "name"] = name;
                if (isGroup) {
                    const metadata = await conn.groupMetadata(id).catch(() => null);
                    if (name || metadata?.subject) chatObj.subject = name || metadata.subject;
                    if (!metadata) continue;
                    chatObj.metadata = metadata;
                }
            }
        } catch (e) {
            console.error("Erro em chats.set:", e);
        }
    });

    conn.ev.on("group-participants.update", async ({ id, participants, action }) => {
        if (!id) return;
        id = conn.decodeJid(id);
        if (id === "status@broadcast") return;
        if (!(id in conn.chats)) conn.chats[id] = { id: id };
        const chats = conn.chats[id];
        chats.isChats = true;
        const groupMetadata = await conn.groupMetadata(id).catch(() => null);
        if (!groupMetadata) return;
        chats.subject = groupMetadata.subject;
        chats.metadata = groupMetadata;
    });

    conn.ev.on("chats.upsert", (chatsUpsert) => {
        try {
            const { id } = chatsUpsert;
            if (!id || id === "status@broadcast") return;
            conn.chats[id] = {
                ...(conn.chats[id] || {}),
                ...chatsUpsert,
                isChats: true,
            };
        } catch (e) {
            console.error("Erro em chats.upsert:", e);
        }
    });

    conn.ev.on("presence.update", async ({ id, presences }) => {
        try {
            const sender = Object.keys(presences)[0] || id;
            const _sender = conn.decodeJid(sender);
            const presence = presences[sender]["lastKnownPresence"] || "composing";
            let chats = conn.chats[_sender];
            if (!chats) chats = conn.chats[_sender] = { id: sender };
            chats.presences = presence;
        } catch (e) {
            console.error("Erro em presence.update:", e);
        }
    });
}

const KEY_MAP = {
    "pre-key": "preKeys",
    "session": "sessions", // Alterado de Rubysession para session para maior compatibilidade
    "sender-key": "senderKeys",
    "app-state-sync-key": "appStateSyncKeys",
    "app-state-sync-version": "appStateVersions",
    "sender-key-memory": "senderKeyMemory",
};

function useSingleFileAuthState(filename, logger) {
    let creds;
    let keys = {};
    let saveCount = 0;

    const saveState = (forceSave) => {
        saveCount++;
        if (forceSave || saveCount > 5) {
            writeFileSync(
                filename,
                JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
            );
            saveCount = 0;
        }
    };

    if (existsSync(filename)) {
        const result = JSON.parse(
            readFileSync(filename, { encoding: "utf-8" }),
            BufferJSON.reviver
        );
        creds = result.creds;
        keys = result.keys;
    } else {
        creds = initAuthCreds();
        keys = {};
    }

    return {
        state: {
            creds,
            keys: {
                get: (type, ids) => {
                    const key = KEY_MAP[type];
                    return ids.reduce((dict, id) => {
                        let value = keys[key]?.[id];
                        if (value) {
                            if (type === "app-state-sync-key") {
                                value = proto.AppStateSyncKeyData.fromObject(value);
                            }
                            dict[id] = value;
                        }
                        return dict;
                    }, {});
                },
                set: (data) => {
                    for (const _key in data) {
                        const key = KEY_MAP[_key];
                        keys[key] = keys[key] || {};
                        Object.assign(keys[key], data[_key]);
                    }
                    saveState();
                },
            },
        },
        saveState,
    };
}

function loadMessage(jid, id = null) {
    // Esta função requer um sistema de armazenamento de mensagens ativo
    // que geralmente é definido no handler principal.
    return null; 
}

export default {
    bind,
    useSingleFileAuthState,
    loadMessage,
};