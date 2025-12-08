// Toast Notification System
class ToastNotification {
  static show(message, type = 'info', duration = 5000) {
    const toast = document.createElement('div');
    toast.className = `toast-notification toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 1000;
      font-weight: 500;
      animation: slideInUp 0.3s ease;
      max-width: 400px;
      word-wrap: break-word;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.animation = 'slideOutDown 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// Contact Form Handler
class ContactFormHandler {
  constructor() {
    this.form = document.getElementById('contactForm');
    this.nameInput = document.getElementById('contactName');
    this.emailInput = document.getElementById('contactEmail');
    this.messageInput = document.getElementById('contactMessage');
    this.submitBtn = document.querySelector('.btn-gradient');
    this.db = firebase.firestore();
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
      this.addInputValidation();
    }
  }

  // Add real-time input validation
  addInputValidation() {
    this.nameInput.addEventListener('blur', () => {
      if (this.nameInput.value.trim() && this.nameInput.value.trim().length < 2) {
        this.addInputError(this.nameInput, 'Name must be at least 2 characters');
      } else {
        this.removeInputError(this.nameInput);
      }
    });

    this.emailInput.addEventListener('blur', () => {
      if (this.emailInput.value.trim() && !this.isValidEmail(this.emailInput.value.trim())) {
        this.addInputError(this.emailInput, 'Please enter a valid email');
      } else {
        this.removeInputError(this.emailInput);
      }
    });

    this.messageInput.addEventListener('blur', () => {
      if (this.messageInput.value.trim() && this.messageInput.value.trim().length < 10) {
        this.addInputError(this.messageInput, 'Message must be at least 10 characters');
      } else {
        this.removeInputError(this.messageInput);
      }
    });
  }

  // Add error styling to input
  addInputError(input, message) {
    input.classList.add('is-invalid');
    if (!input.nextElementSibling || input.nextElementSibling.className !== 'invalid-feedback') {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'invalid-feedback';
      errorDiv.textContent = message;
      input.parentNode.appendChild(errorDiv);
    }
  }

  // Remove error styling from input
  removeInputError(input) {
    input.classList.remove('is-invalid');
    const errorDiv = input.nextElementSibling;
    if (errorDiv && errorDiv.className === 'invalid-feedback') {
      errorDiv.remove();
    }
  }

  // Validate email format
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate form inputs
  validateForm() {
    const name = this.nameInput.value.trim();
    const email = this.emailInput.value.trim();
    const message = this.messageInput.value.trim();

    if (!name) {
      ToastNotification.show('Please enter your name', 'error');
      this.nameInput.focus();
      return false;
    }

    if (name.length < 2) {
      ToastNotification.show('Name must be at least 2 characters', 'error');
      return false;
    }

    if (!email) {
      ToastNotification.show('Please enter your email', 'error');
      this.emailInput.focus();
      return false;
    }

    if (!this.isValidEmail(email)) {
      ToastNotification.show('Please enter a valid email address', 'error');
      this.emailInput.focus();
      return false;
    }

    if (!message) {
      ToastNotification.show('Please enter your message', 'error');
      this.messageInput.focus();
      return false;
    }

    if (message.length < 10) {
      ToastNotification.show('Message must be at least 10 characters long', 'error');
      return false;
    }

    return true;
  }

  // Handle form submission
  async handleSubmit(e) {
    e.preventDefault();

    // Validate form
    if (!this.validateForm()) {
      return;
    }

    // Disable submit button
    this.submitBtn.disabled = true;
    const originalText = this.submitBtn.innerHTML;
    this.submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending...';

    try {
      const formData = {
        name: this.nameInput.value.trim(),
        email: this.emailInput.value.trim(),
        message: this.messageInput.value.trim(),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        status: 'new',
        userAgent: navigator.userAgent
      };

      // Add to Firestore
      const docRef = await this.db.collection('contact_messages').add(formData);
      
      console.log('Message sent successfully with ID:', docRef.id);
      
      // Show success message
      ToastNotification.show('✓ Thank you! Your message has been sent successfully.', 'success', 5000);
      
      // Reset form
      this.form.reset();
      
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'Error sending message: ';
      
      if (error.code === 'permission-denied') {
        errorMessage += 'Permission denied. Please try again later.';
      } else if (error.code === 'unavailable') {
        errorMessage += 'Service temporarily unavailable. Please try again.';
      } else if (error.code === 'unauthenticated') {
        errorMessage += 'Authentication error. Please refresh and try again.';
      } else {
        errorMessage += error.message;
      }
      
      ToastNotification.show(errorMessage, 'error');
    } finally {
      // Re-enable submit button
      this.submitBtn.disabled = false;
      this.submitBtn.innerHTML = originalText;
    }
  }
}

// Initialize form handler when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Wait for Firebase to initialize
  if (typeof firebase !== 'undefined' && firebase.firestore) {
    new ContactFormHandler();
  } else {
    console.error('Firebase not loaded. Make sure firebase-config.js is loaded before contact-form.js');
  }
});

// Add CSS for toast notifications and form validation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInUp {
    from {
      transform: translateY(100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  @keyframes slideOutDown {
    from {
      transform: translateY(0);
      opacity: 1;
    }
    to {
      transform: translateY(100%);
      opacity: 0;
    }
  }

  .is-invalid {
    border-color: #ef4444 !important;
  }

  .invalid-feedback {
    color: #ef4444;
    font-size: 0.875rem;
    margin-top: 0.25rem;
    display: block;
  }

  .btn-gradient:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .spinner-border-sm {
    width: 1rem;
    height: 1rem;
    border-width: 0.2em;
  }
`;
document.head.appendChild(style);

