import '@testing-library/jest-dom';
import Navbar from './components/layout/Navbar';
import { AuthProvider } from './hooks/useAuth';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ApplicationForm from './components/hirer/ApplicationForm';
import React from 'react';

// test suite to verify navbar component
describe('Navbar', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  // check sign in and sign up buttons show when not logged in
  test('case: renders sign up and sign in buttons when not authenticated', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  // authenticated user sees Account button instead of Sign Up/Sign In
  test('case: renders account button when authenticated', () => {
    const loggedInUser = {
      id: 1,
      email: 'vendor@demo.com',
      role: 'Vendor',
      phone: '0398 765 432',
      businessName: 'Metro Events Pty Ltd',
    };
    localStorage.setItem('vv_current_user', JSON.stringify(loggedInUser));
    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>
    );
    expect(screen.getByText('Account')).toBeInTheDocument();
  });

  // opening Account dropdown shows welcome message and user email
  test('case: should display a welcome message in account drop down menu', () => {
    const loggedInUser = {
      id: 1,
      email: 'vendor@demo.com',
      role: 'Vendor',
      phone: '0398 765 432',
      businessName: 'Metro Events Pty Ltd',
    };
    localStorage.setItem('vv_current_user', JSON.stringify(loggedInUser));
    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>
    );
    const accountButton = screen.getByRole('button', { name: /account/i });
    userEvent.click(accountButton);
    expect(screen.getByText(/signed in as/i)).toBeInTheDocument();
    expect(screen.getByText(loggedInUser.email)).toBeInTheDocument();
  });
});


// test suite to verify application form component
describe('ApplicationForm', () => {

  // all required form fields are present on initial render
  test('case: renders all application form fields', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ApplicationForm />
        </MemoryRouter>
      </AuthProvider>
    );
    await waitFor(() => {
      expect(screen.getByLabelText('Select Venue *')).toBeInTheDocument();
      expect(screen.getByText('Choose a venue...')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Name *')).toBeInTheDocument();
      expect(screen.getByLabelText('Expected Guests *')).toBeInTheDocument();
      expect(screen.getByLabelText('Duration (hours) *')).toBeInTheDocument();
      expect(screen.getByLabelText('Event Date *')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Time *')).toBeInTheDocument();
    });
  });

  // submitting empty form triggers validation errors for all required fields
  test('case: shows errors when required fields are empty', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ApplicationForm />
        </MemoryRouter>
      </AuthProvider>
    );
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    userEvent.click(submitButton);
    expect(screen.getByText('Please select a venue.')).toBeInTheDocument();
    expect(screen.getByText('Event name is required.')).toBeInTheDocument();
    expect(screen.getByText('Expected guests is required.')).toBeInTheDocument();
    expect(screen.getByText('Duration is required.')).toBeInTheDocument();
    expect(screen.getByText('Date is required.')).toBeInTheDocument();
    expect(screen.getByText('Start time is required.')).toBeInTheDocument();
  });

  // negative guest count is rejected
  test('case: shows errors when expected guests is not a positive number', () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ApplicationForm />
        </MemoryRouter>
      </AuthProvider>
    );
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    const expectedGuestsInput = screen.getByLabelText('Expected Guests *');
    userEvent.type(expectedGuestsInput, '-5');
    userEvent.click(submitButton);
    expect(screen.getByText('Expected guests must be a positive number.')).toBeInTheDocument();
  });

  // ABN shorter than 10 characters triggers validation error
  test('case: shows errors when abn is not 10 characters', async () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <ApplicationForm />
        </MemoryRouter>
      </AuthProvider>
    );
    const expandButton = screen.getByText('Expand for business documents', { selector: 'button' });
    expandButton.click();
    await screen.findByLabelText('ABN (10 characters)');
    const abnInput = screen.getByLabelText('ABN (10 characters)');
    userEvent.type(abnInput, '12345678'); // 8 chars
    const submitButton = screen.getByRole('button', { name: /submit application/i });
    userEvent.click(submitButton);
    expect(screen.getByText('ABN must be exactly 10 characters.')).toBeInTheDocument();
  });
});


// test suite to verify useAuth session persistence
describe('useAuth', () => {

  // AuthProvider reads persisted user from localStorage on mount
  test('case: loads current user from localStorage on mount', () => {
    const storedUser = {
      id: 1,
      email: 'hirer@demo.com',
      role: 'Hirer',
      phone: '0412 345 678',
      firstName: 'Alex',
      lastName: 'Johnson',
    };
    localStorage.setItem('vv_current_user', JSON.stringify(storedUser));

    let receivedUser: any = null;
    const { useAuth } = require('./hooks/useAuth');
    const TestComponent = () => {
      const { currentUser } = useAuth();
      receivedUser = currentUser;
      return null;
    };
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    expect(receivedUser).toEqual(storedUser);
  });
});
