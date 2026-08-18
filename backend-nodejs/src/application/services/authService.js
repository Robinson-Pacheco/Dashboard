const jwt = require('jsonwebtoken');
const User = require('../../domain/models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
};

const registerUser = async (userData) => {
  const { username, password, email, names, role } = userData;

  const existingUser = await User.findOne({ $or: [{ email }, { username }] });
  if (existingUser) {
    const error = new Error('User with this email or username already exists');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    username,
    password,
    email,
    names,
    role: role || 'viewer'
  });

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      names: user.names,
      role: user.role
    },
    token
  };
};

const loginUser = async (loginData) => {
  const { username, password } = loginData;

  const user = await User.findOne({ username }).select('+password');
  if (!user) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      names: user.names,
      role: user.role
    },
    token
  };
};

const getCurrentUser = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    names: user.names,
    role: user.role
  };
};

const getAllUsers = async () => {
  const users = await User.find({})
    .select('-password')
    .sort({ createdAt: -1 });

  return users.map(user => ({
    id: user._id,
    username: user.username,
    email: user.email,
    names: user.names,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt
  }));
};

const deleteUser = async (userId, currentUserId) => {
  if (userId === currentUserId) {
    const error = new Error('Cannot delete your own account');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.findById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  await User.findByIdAndDelete(userId);

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    names: user.names,
    role: user.role
  };
};

module.exports = {
  registerUser,
  loginUser,
  getCurrentUser,
  getAllUsers,
  deleteUser
};