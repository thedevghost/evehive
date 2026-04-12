module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_team', ({ team_id }) => {
      socket.join(`team_${team_id}`);
      console.log(`Socket ${socket.id} joined team_${team_id}`);
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
};
