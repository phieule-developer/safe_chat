const jwt = require('jsonwebtoken');

const socket = io => {
    client = {};

    io.on('connection',async socket => {
        try {
            let token = socket.handshake.query["x_access_token"];
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await this.userService.getOneById(decoded.id);
            if (user && decoded.exp >= Date.now()) {
                if (Array.isArray(this.client[decoded.id])) {
                    this.client[decoded.id].push(socket.id);
                } else {

                    this.client[decoded.id] = [];

                    this.client[decoded.id].push(socket.id);
                }
            }
        }
        socket.on('disconnect', () => {
            if (token) {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                if (decoded && Array.isArray(this.client[decoded.id])) {
                    if (this.client[decoded.id].indexOf(socket.id) != -1) {
                        this.client[decoded.id] = this.client[decoded.id].filter(e => e !== socket.id)
                    }
                }
            }
        });
        } catch (error) {    
        }
    });
}
 const sendReportToUser = (user_id, event_name, data)=>{
    try {
      if (this.client[user_id]) {
        for (let id of this.client[user_id]) {
          this.server.to(id).emit(event_name, data)
        }
      }
    } catch (error) {
    }
  }
module.exports = {
    socket,
    sendReportToUser
};