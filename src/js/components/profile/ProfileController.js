import { store } from '../../core/store.js';
import { API } from '../../core/api.js';
import { EventEmitter } from '../../utils/eventEmitter.js';
import { validator } from '../../utils/validator.js';

export class ProfileController {
    constructor() {
        this.store = store;
        this.api = new API();
        this.events = new EventEmitter();
        this.currentUser = {
            login: 'leomart-wd',
            lastActive: '2025-08-29 13:06:50'
        };
        
        this.validationRules = {
            email: {
                required: true,
                email: true
            },
            phoneNumber: {
                pattern: /^\+?[\d\s-]{10,}$/
            },
            website: {
                url: true
            },
            biography: {
                maxLength: 500
            }
        };
    }

    async initialize() {
        try {
            await this.loadUserProfile();
            this.setupEventListeners();
            return true;
        } catch (error) {
            console.error('Profile initialization failed:', error);
            throw error;
        }
    }

    async loadUserProfile() {
        try {
            const profile = await this.api.get(`/users/${this.currentUser.login}/profile`);
            this.store.dispatch('SET_PROFILE', profile);
            return profile;
        } catch (error) {
            console.error('Failed to load profile:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Profile form submission
        const profileForm = document.getElementById('profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', this.handleProfileUpdate.bind(this));
        }

        // Settings form submission
        const settingsForm = document.getElementById('settings-form');
        if (settingsForm) {
            settingsForm.addEventListener('submit', this.handleSettingsUpdate.bind(this));
        }

        // Real-time validation
        document.querySelectorAll('[data-validate]').forEach(input => {
            input.addEventListener('blur', this.validateField.bind(this));
        });
    }

    async handleProfileUpdate(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const profileData = Object.fromEntries(formData);

        try {
            // Validate form data
            const validationResult = this.validateForm(profileData);
            if (!validationResult.isValid) {
                this.showValidationErrors(validationResult.errors);
                return;
            }

            // Update profile
            const updatedProfile = await this.api.put(
                `/users/${this.currentUser.login}/profile`,
                profileData
            );

            // Update store
            this.store.dispatch('SET_PROFILE', updatedProfile);

            // Show success message
            this.showSuccessMessage('Profile updated successfully');

        } catch (error) {
            console.error('Profile update failed:', error);
            this.showErrorMessage('Failed to update profile');
        }
    }

    async handleSettingsUpdate(event) {
        event.preventDefault();
        
        const form = event.target;
        const formData = new FormData(form);
        const settings = Object.fromEntries(formData);

        try {
            // Update settings
            const updatedSettings = await this.api.put(
                `/users/${this.currentUser.login}/settings`,
                settings
            );

            // Update store
            this.store.dispatch('SET_SETTINGS', updatedSettings);

            // Apply settings changes
            this.applySettings(updatedSettings);

            // Show success message
            this.showSuccessMessage('Settings updated successfully');

        } catch (error) {
            console.error('Settings update failed:', error);
            this.showErrorMessage('Failed to update settings');
        }
    }

    validateForm(data) {
        const errors = {};
        let isValid = true;

        Object.entries(this.validationRules).forEach(([field, rules]) => {
            if (data[field]) {
                const fieldErrors = validator.validate(data[field], rules);
                if (fieldErrors.length > 0) {
                    errors[field] = fieldErrors;
                    isValid = false;
                }
            } else if (rules.required) {
                errors[field] = ['This field is required'];
                isValid = false;
            }
        });

        return { isValid, errors };
    }

    validateField(event) {
        const field = event.target;
        const fieldName = field.name;
        const rules = this.validationRules[fieldName];

        if (!rules) return;

        const errors = validator.validate(field.value, rules);
        this.showFieldValidation(field, errors);
    }

    showFieldValidation(field, errors) {
        const container = field.closest('.form-group');
        const errorElement = container.querySelector('.field-error');

        if (errors.length > 0) {
            field.classList.add('invalid');
            if (errorElement) {
                errorElement.textContent = errors[0];
                errorElement.classList.remove('hidden');
            }
        } else {
            field.classList.remove('invalid');
            if (errorElement) {
                errorElement.classList.add('hidden');
            }
        }
    }

    applySettings(settings) {
        // Apply theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }

        // Apply language
        if (settings.language) {
            document.documentElement.setAttribute('lang', settings.language);
        }

        // Apply notifications settings
        if ('notifications' in settings) {
            this.updateNotificationSettings(settings.notifications);
        }

        // Apply accessibility settings
        if (settings.accessibility) {
            this.applyAccessibilitySettings(settings.accessibility);
        }
    }

    render() {
        const profile = this.store.getState().profile;
        const settings = this.store.getState().settings;

        return `
            <div class="profile-container">
                <div class="profile-header">
                    <div class="profile-avatar">
                        <img src="${profile.avatar}" alt="${profile.name}">
                        <button class="btn-change-avatar">
                            <i class="fas fa-camera"></i>
                        </button>
                    </div>
                    <div class="profile-info">
                        <h1>${profile.name}</h1>
                        <p class="profile-role">${profile.role}</p>
                    </div>
                </div>

                <div class="profile-content">
                    <div class="profile-section">
                        ${this.renderProfileForm(profile)}
                    </div>

                    <div class="settings-section">
                        ${this.renderSettingsForm(settings)}
                    </div>
                </div>
            </div>
        `;
    }

    renderProfileForm(profile) {
        return `
            <form id="profile-form" class="form">
                <h2>Profile Information</h2>
                
                <div class="form-group">
                    <label for="name">Full Name</label>
                    <input type="text" 
                           id="name" 
                           name="name" 
                           value="${profile.name}"
                           data-validate="required">
                    <span class="field-error hidden"></span>
                </div>

                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" 
                           id="email" 
                           name="email" 
                           value="${profile.email}"
                           data-validate="required,email">
                    <span class="field-error hidden"></span>
                </div>

                <div class="form-group">
                    <label for="biography">Biography</label>
                    <textarea id="biography" 
                            name="biography" 
                            rows="4"
                            data-validate="maxLength:500">${profile.biography}</textarea>
                    <span class="field-error hidden"></span>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        Save Changes
                    </button>
                </div>
            </form>
        `;
    }

    renderSettingsForm(settings) {
        return `
            <form id="settings-form" class="form">
                <h2>Account Settings</h2>

                <div class="form-group">
                    <label for="theme">Theme</label>
                    <select id="theme" name="theme">
                        <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>
                            Light
                        </option>
                        <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>
                            Dark
                        </option>
                        <option value="system" ${settings.theme === 'system' ? 'selected' : ''}>
                            System
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="language">Language</label>
                    <select id="language" name="language">
                        <option value="en" ${settings.language === 'en' ? 'selected' : ''}>
                            English
                        </option>
                        <option value="it" ${settings.language === 'it' ? 'selected' : ''}>
                            Italiano
                        </option>
                    </select>
                </div>

                <div class="form-group">
                    <h3>Notifications</h3>
                    <label class="checkbox">
                        <input type="checkbox" 
                               name="notifications.email" 
                               ${settings.notifications?.email ? 'checked' : ''}>
                        Email Notifications
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" 
                               name="notifications.push" 
                               ${settings.notifications?.push ? 'checked' : ''}>
                        Push Notifications
                    </label>
                </div>

                <div class="form-group">
                    <h3>Accessibility</h3>
                    <label class="checkbox">
                        <input type="checkbox" 
                               name="accessibility.reducedMotion" 
                               ${settings.accessibility?.reducedMotion ? 'checked' : ''}>
                        Reduce Motion
                    </label>
                    <label class="checkbox">
                        <input type="checkbox" 
                               name="accessibility.highContrast" 
                               ${settings.accessibility?.highContrast ? 'checked' : ''}>
                        High Contrast
                    </label>
                </div>

                <div class="form-actions">
                    <button type="submit" class="btn-primary">
                        Save Settings
                    </button>
                </div>
            </form>
        `;
    }
}

export const profileController = new ProfileController();