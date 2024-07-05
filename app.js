var conf = require('./config/conf');
var TelegramBot = require('node-telegram-bot-api');


/*创建实例对象开始*/
var bot = new TelegramBot(conf.token, { polling: true });
/*创建实例对象结束*/

/*监听新消息*/
bot.on('message', (msg) => {
    conf.pool.getConnection(function (err, connection) {
        if (err) throw err;
        connection.query(`SELECT * FROM users where telegramid = ${msg.from.id};`, (error, result) => {
            if (error) throw error;
            if (result.length == 0) {
                connection.query(`Insert into users (username,telegramid,name,register_time) values ("${(msg.from.username ? msg.from.username : "")}","${msg.from.id}","${utf16toEntities((msg.from.first_name ? msg.from.first_name : "") + (msg.from.last_name ? msg.from.last_name : ""))}",now());`, (error, result) => {
                    connection.destroy();
                    if (error) throw error;
                    main(msg)
                });
            } else if (result[0].isban == 1 && msg.chat.type == 'private') {
                bot.sendMessage(msg.from.id, `<b>您已被拉黑</b>`, {
                    parse_mode: "HTML"
                })
            } else {
                connection.query(`update users set username = "${(msg.from.username ? msg.from.username : "")}",name = "${utf16toEntities((msg.from.first_name ? msg.from.first_name : "") + (msg.from.last_name ? msg.from.last_name : ""))}" where telegramid = "${msg.from.id}";`, (error, result) => {
                    connection.destroy();
                    if (error) throw error;
                    main(msg)
                });
            }
        });
    })
});

function main (msg) {
    if (msg.text) {
        if (msg.text == "/start") {
            bot.sendMessage(msg.from.id, `<b>👏欢迎使用聊天机器人，请直接发送消息</b>`, {
                parse_mode: "HTML"
            })
        } else if (msg.text.search("/send") == 0 && msg.chat.id == conf.adminid) {
            qunfa(msg)
        } else if (msg.chat.id != conf.adminid && msg.chat.type == 'private') {
            bot.forwardMessage(conf.adminid, msg.chat.id, msg.message_id, {
                disable_web_page_preview: true
            })
                .then(res => {
                    conf.pool.getConnection(function (err, connection) {
                        if (err) throw err;
                        connection.query(`insert into message (messageid,telegramid,time) values ("${res.message_id}","${msg.from.id}",now()) ;`, (error, result) => {
                            connection.destroy();
                            if (error) throw error;
                        });
                    })
                })
        } else if (msg.reply_to_message && msg.chat.id == conf.adminid) {
            conf.pool.getConnection(function (err, connection) {
                if (err) throw err;
                connection.query(`select * from message where messageid = "${msg.reply_to_message.message_id}";`, (error, result) => {
                    connection.destroy();
                    if (error) throw error;
                    if (msg.text == "/ban") {
                        conf.pool.getConnection(function (err, connection) {
                            if (err) throw err;
                            connection.query(`update users set isban = 1 where telegramid = "${result[0].telegramid}";`, (error, result) => {
                                connection.destroy();
                                if (error) throw error;
                                bot.sendMessage(msg.chat.id, `<b>该用户已拉黑</b>`, {
                                    parse_mode: "HTML"
                                })
                            });
                        })
                    } else if (msg.text == "/unban") {
                        conf.pool.getConnection(function (err, connection) {
                            if (err) throw err;
                            connection.query(`update users set isban = 0 where telegramid = "${result[0].telegramid}";`, (error, result) => {
                                connection.destroy();
                                if (error) throw error;
                                bot.sendMessage(msg.chat.id, `<b>该用户已解除拉黑</b>`, {
                                    parse_mode: "HTML"
                                })
                            });
                        })
                    } else {
                        // bot.forwardMessage(result[0].telegramid, msg.chat.id, msg.message_id, {
                        //     disable_web_page_preview: true
                        // })
                        const targetUserId = result[0].telegramid;
                        if (msg.text) {
                            bot.sendMessage(targetUserId, msg.text, {
                                disable_web_page_preview: true
                            });
                        } else if (msg.photo) {
                            const photoFileId = msg.photo[msg.photo.length - 1].file_id;
                            bot.sendPhoto(targetUserId, photoFileId, {
                                caption: msg.caption || ''
                            });
                        } else if (msg.video) {
                            const videoFileId = msg.video.file_id;
                            bot.sendVideo(targetUserId, videoFileId, {
                                caption: msg.caption || ''
                            });
                        } else if (msg.document) {
                            const documentFileId = msg.document.file_id;
                            bot.sendDocument(targetUserId, documentFileId, {
                                caption: msg.caption || ''
                            });
                        } else if (msg.audio) {
                            const audioFileId = msg.audio.file_id;
                            bot.sendAudio(targetUserId, audioFileId, {
                                caption: msg.caption || ''
                            });
                        }
                    }
                });
            })
        }
    } else if (msg.reply_to_message && msg.chat.id == conf.adminid) {
        conf.pool.getConnection(function (err, connection) {
            if (err) throw err;
            connection.query(`select * from message where messageid = "${msg.reply_to_message.message_id}";`, (error, result) => {
                connection.destroy();
                if (error) throw error;
                // bot.forwardMessage(result[0].telegramid, msg.chat.id, msg.message_id, {
                //     disable_web_page_preview: true
                // })
                const targetUserId = result[0].telegramid;
                if (msg.text) {
                    bot.sendMessage(targetUserId, msg.text, {
                        disable_web_page_preview: true
                    });
                } else if (msg.photo) {
                    const photoFileId = msg.photo[msg.photo.length - 1].file_id;
                    bot.sendPhoto(targetUserId, photoFileId, {
                        caption: msg.caption || ''
                    });
                } else if (msg.video) {
                    const videoFileId = msg.video.file_id;
                    bot.sendVideo(targetUserId, videoFileId, {
                        caption: msg.caption || ''
                    });
                } else if (msg.document) {
                    const documentFileId = msg.document.file_id;
                    bot.sendDocument(targetUserId, documentFileId, {
                        caption: msg.caption || ''
                    });
                } else if (msg.audio) {
                    const audioFileId = msg.audio.file_id;
                    bot.sendAudio(targetUserId, audioFileId, {
                        caption: msg.caption || ''
                    });
                }
            });
        })
    } else if (msg.chat.type == 'private') {
        bot.forwardMessage(conf.adminid, msg.chat.id, msg.message_id, {
            disable_web_page_preview: true
        })
            .then(res => {
                conf.pool.getConnection(function (err, connection) {
                    if (err) throw err;
                    connection.query(`insert into message (messageid,telegramid,time) values ("${res.message_id}","${msg.from.id}",now()) ;`, (error, result) => {
                        connection.destroy();
                        if (error) throw error;
                    });
                })
            })
    }

}

function qunfa (msg) {
    conf.pool.getConnection(function (err, connection) {
        if (err) return err;
        connection.query(`SELECT * FROM users order by id;`, (error, result) => {
            if (error) return error;
            connection.destroy();
            var index = 0;
            var successful = 0;
            bot.sendMessage(msg.chat.id, `开始群发`)
            var qunfa = setInterval(function () {
                if (result.length - 1 < index) {
                    bot.sendMessage(msg.chat.id, `群发结束`)
                    clearInterval(qunfa)
                } else {
                    bot.sendMessage(result[index].telegramid, msg.text.split("/send")[1], {
                        parse_mode: 'HTML',
                        disable_web_page_preview: true,
                    })
                        .then(res => {
                            successful++
                            if (successful % 100 == 0) {
                                bot.sendMessage(msg.chat.id, `已成功群发${successful}次`)
                            }
                            index++
                        })
                        .catch(res => {
                            index++
                        });
                }
            }, 1000)
        });
    })
}


function utf16toEntities (str) {
    const patt = /[\ud800-\udbff][\udc00-\udfff]/g;
    str = str.replace(patt, (char) => {
        let H;
        let L;
        let code;
        let s;

        if (char.length === 2) {
            H = char.charCodeAt(0);
            L = char.charCodeAt(1);
            code = (H - 0xD800) * 0x400 + 0x10000 + L - 0xDC00;
            s = `&#${code};`;
        } else {
            s = char;
        }

        return s;
    });

    return str;
}
