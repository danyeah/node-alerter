import jwt from 'jsonwebtoken';



// Verify JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET not found in environment variables');
  console.error('Make sure your .env file contains JWT_SECRET');
  process.exit(1);
}

// Generate token with 30 days expiry
const token = jwt.sign({}, process.env.JWT_SECRET, { expiresIn: '30d' });

// Output in different formats
console.log('\nGenerated JWT Token:\n');
console.log('Raw token:');
console.log(token);
console.log('\nFor use with curl:');
console.log(`Authorization: Bearer ${token}`);
console.log('\ncurl example:');
console.log(`curl -X POST http://localhost:${process.env.PORT || 3000}/api/message \\
  -H "Authorization: Bearer ${token}" \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Test message"}'`); 