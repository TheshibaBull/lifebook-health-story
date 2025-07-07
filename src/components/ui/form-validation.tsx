
import { z } from 'zod';
import React from 'react';

// Common validation schemas
export const emailSchema = z.string()
  .email('Please enter a valid email address')
  .min(1, 'Email is required');

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const phoneSchema = z.string()
  .regex(/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number')
  .optional()
  .or(z.literal(''));

export const nameSchema = z.string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters')
  .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces');

// Sign up form validation schema
export const signUpSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  gender: z.enum(['male', 'female', 'other', 'prefer-not-to-say'], {
    required_error: 'Please select a gender'
  }),
  dateOfBirth: z.string()
    .min(1, 'Date of birth is required')
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 13 && age <= 120;
    }, 'Age must be between 13 and 120 years'),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  allergies: z.array(z.string()).optional(),
  password: passwordSchema,
  confirmPassword: z.string(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

// Sign in form validation schema
export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

// Family member validation schema
export const familyMemberSchema = z.object({
  name: nameSchema,
  relation: z.string().min(1, 'Relationship is required'),
  email: emailSchema.optional().or(z.literal('')),
  phone: phoneSchema,
  dateOfBirth: z.string().optional(),
  bloodGroup: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
    .optional(),
  medicalConditions: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  medications: z.array(z.string()).optional(),
  emergencyContact: z.boolean().optional()
});

// Appointment validation schema
export const appointmentSchema = z.object({
  doctorId: z.string().min(1, 'Please select a doctor'),
  appointmentDate: z.string().min(1, 'Please select a date'),
  appointmentTime: z.string().min(1, 'Please select a time'),
  appointmentType: z.string().min(1, 'Please select appointment type'),
  notes: z.string().optional()
});

// Validation helper function with proper generic syntax
export function validateForm<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        if (err.path.length > 0) {
          errors[err.path[0].toString()] = err.message;
        }
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
}

// Form field validation component
interface FormFieldProps {
  error?: string;
  children: React.ReactNode;
}

export const FormField = ({ error, children }: FormFieldProps) => (
  <div className="space-y-1">
    {children}
    {error && (
      <p className="text-sm text-red-600" role="alert">
        {error}
      </p>
    )}
  </div>
);
