import mongoose from 'mongoose';

const connection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://oglesbyrodriguez:oglesby123@cluster0.jva82.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1); // Exit with failure
  }
};

export default connection;

