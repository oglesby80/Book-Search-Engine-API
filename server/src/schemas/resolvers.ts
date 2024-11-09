import { gql, AuthenticationError } from '@apollo/server';
import User from '../models/User';
import { signToken } from '../services/auth';
import { JwtPayload } from '../types'; // Assuming JwtPayload is a type you've defined for JWT payloads

interface Context {
  user?: JwtPayload;
}

const resolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: Context) => {
      if (context.user) {
        return await User.findById(context.user._id).populate('savedBooks');
      }
      throw new AuthenticationError('Not logged in');
    },
  },
  Mutation: {
    login: async (_: unknown, { email, password }: { email: string; password: string }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Incorrect credentials');
      }
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    addUser: async (_: unknown, { username, email, password }: { username: string; email: string; password: string }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user.username, user.email, user._id);
      return { token, user };
    },
    saveBook: async (
      _: unknown,
      { bookId, authors, description, title, image, link }: 
      { bookId: string; authors: string[]; description: string; title: string; image: string; link: string }, 
      context: Context
    ) => {
      if (context.user) {
        return await User.findByIdAndUpdate(
          context.user._id,
          { $addToSet: { savedBooks: { bookId, authors, description, title, image, link } } },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError('You need to be logged in');
    },
    removeBook: async (_: unknown, { bookId }: { bookId: string }, context: Context) => {
      if (context.user) {
        return await User.findByIdAndUpdate(
          context.user._id,
          { $pull: { savedBooks: { bookId } } },
          { new: true }
        );
      }
      throw new AuthenticationError('You need to be logged in');
    },
  },
};

export default resolvers;

