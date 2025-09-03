import {  checkSchema } from 'express-validator';

const validateUserCredentials = checkSchema({
  email: {
    notEmpty: {
      errorMessage: "Email should not be empty",
    },
    isEmail: {
      errorMessage: "Email must be a valid email",
    },
  },
  password: {
    notEmpty: {
      errorMessage: "Password should not be empty",
    },
    isString: {
      errorMessage: "Password must be a valid string",
    },
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long",
    },
    custom: {
      options: (value) => {
        const errors = [];
        if (!/\d/.test(value)) {
          errors.push('Password must contain at least one number');
        }
        if (!/[A-Z]/.test(value)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(value)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[@$!%*?&#]/.test(value)) {
          errors.push('Password must contain at least one special character');
        }
        if (errors.length > 0) {
          throw new Error(errors.join('. '));
        }
        return true;
      },
    },
  },
});

const validateUserUpdateCredentials = checkSchema({
 email:{
    optional: true,
    isEmail:{
      errorMessage:"Email must be a valid email"
    }
 },
  newPassword:{

    optional: true,

    isString:{
      errorMessage:"Name must be a valid string"
    },
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long",
    },
    custom:{
      options:(value)=>{
        const errors = [];
        if (!/\d/.test(value)) {
          errors.push('Password must contain at least one number');
        }
        if (!/[A-Z]/.test(value)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(value)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[@$!%*?&#]/.test(value)) {
          errors.push('Password must contain at least one special character');
        }
        if (errors.length > 0) {
          throw new Error(errors.join('. '));
        }
        return true;
      }
    }
  },
  confirmNewPassword:{

    optional: true,

    isString:{
      errorMessage:"Name must be a valid string"
    },
    isLength: {
      options: { min: 8 },
      errorMessage: "Password must be at least 8 characters long",
    },
    custom:{
      options:(value)=>{
        const errors = [];
        if (!/\d/.test(value)) {
          errors.push('Password must contain at least one number');
        }
        if (!/[A-Z]/.test(value)) {
          errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(value)) {
          errors.push('Password must contain at least one lowercase letter');
        }
        if (!/[@$!%*?&#]/.test(value)) {
          errors.push('Password must contain at least one special character');
        }
        if (errors.length > 0) {
          throw new Error(errors.join('. '));
        }
        return true;
      }
    }
  },
  
})

export { validateUserCredentials,validateUserUpdateCredentials };