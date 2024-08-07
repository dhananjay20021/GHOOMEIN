function createUserSession(req, user, action) {
    console.log('User:', user);
    console.log('User _id:', user.id);
  
    if (user && user.id) {
      req.session.uid = user.id.toString();
      req.session.isAdmin = user.isAdmin;
      req.session.save(action);
    } else {
      console.log('Invalid user object:', user);
    }
  }
  
  
  function destroyUserAuthSession(req) {
    req.session.uid = null;
  }
  
  module.exports = {
    createUserSession: createUserSession,
    destroyUserAuthSession: destroyUserAuthSession
  };
  