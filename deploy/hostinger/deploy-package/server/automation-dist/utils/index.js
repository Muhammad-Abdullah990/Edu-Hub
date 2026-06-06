import { v4 as uuidv4 } from "uuid";
export function generateId() {
    return uuidv4();
}
export function formatDate(date) {
    return date.toISOString().split('T')[0];
}
export function formatDateTime(date) {
    return date.toISOString();
}
export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
export function retry(fn, attempts = 3, delay = 1000) {
    return fn().catch(error => {
        if (attempts <= 1) {
            throw error;
        }
        return sleep(delay).then(() => retry(fn, attempts - 1, delay * 2));
    });
}
export function validatePhoneNumber(phone) {
    // Basic phone number validation - adjust as needed
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
}
export function sanitizeFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
}
export function calculateFileSize(bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0)
        return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
export function generateChecksum(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
}
//# sourceMappingURL=index.js.map