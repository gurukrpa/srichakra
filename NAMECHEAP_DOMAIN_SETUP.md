# Namecheap Domain Setup for srichakraacademy.org

## Step 1: Add Custom Domain in Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/project/srichakraacademy-3f745/hosting/sites
2. Click on **"srichakraacademy-org"** site
3. Click **"Add custom domain"** button
4. Enter: `srichakraacademy.org`
5. Click **"Continue"**

Firebase will show you verification records. Note them down!

---

## Step 2: Configure DNS Records in Namecheap

### Go to Namecheap Dashboard:
1. Login to https://www.namecheap.com/
2. Go to **Domain List**
3. Find **srichakraacademy.org**
4. Click **"Manage"**
5. Go to **"Advanced DNS"** tab

---

## Step 3: Add DNS Records

Firebase will give you records similar to these. Add them in Namecheap:

### A. For Domain Verification (TXT Record):
```
Type: TXT Record
Host: @
Value: [Firebase will provide this - looks like: firebase=xxxxxxxxxxxx]
TTL: Automatic or 1 min
```

### B. For Website (A Records):
Delete any existing A records for `@` and `www`, then add these:

**Record 1:**
```
Type: A Record
Host: @
Value: 151.101.1.195
TTL: Automatic or 5 min
```

**Record 2:**
```
Type: A Record
Host: @
Value: 151.101.65.195
TTL: Automatic or 5 min
```

### C. For WWW subdomain (CNAME or A Records):

**Option 1 - CNAME (Recommended):**
```
Type: CNAME Record
Host: www
Value: srichakraacademy-org.web.app.
TTL: Automatic or 5 min
```

**Option 2 - A Records (if CNAME doesn't work):**
```
Type: A Record
Host: www
Value: 151.101.1.195
TTL: Automatic or 5 min

Type: A Record
Host: www
Value: 151.101.65.195
TTL: Automatic or 5 min
```

---

## Step 4: Wait for Verification

1. After adding DNS records in Namecheap, go back to Firebase Console
2. Click **"Verify"** button
3. Firebase will check your DNS records
4. If successful, Firebase will provision SSL certificate (this can take 24-48 hours)

---

## Step 5: Verify Setup

Once DNS propagates (usually 5-30 minutes, max 48 hours):

1. Check if domain resolves:
   ```bash
   nslookup srichakraacademy.org
   dig srichakraacademy.org
   ```

2. Visit your site:
   - http://srichakraacademy.org (will redirect to https)
   - https://srichakraacademy.org
   - https://www.srichakraacademy.org

---

## Common Issues & Solutions

### Issue 1: Domain not verifying
- **Solution:** Wait 5-10 minutes after adding TXT record, then try again
- Check if TXT record is correct: `dig TXT srichakraacademy.org`

### Issue 2: "Site can't be reached"
- **Solution:** DNS hasn't propagated yet. Wait longer (up to 48 hours)
- Clear browser cache or try incognito mode

### Issue 3: SSL Certificate Pending
- **Solution:** This is normal. SSL provisioning takes 24-48 hours after domain verification
- Site will work on HTTP until SSL is ready, then auto-upgrade to HTTPS

### Issue 4: Namecheap showing "Parking Page"
- **Solution:** Make sure you're using Namecheap's nameservers, not custom ones
- If using custom nameservers, add records there instead

---

## Quick Verification Commands

```bash
# Check A records
dig A srichakraacademy.org +short

# Check TXT record (for verification)
dig TXT srichakraacademy.org +short

# Check CNAME for www
dig CNAME www.srichakraacademy.org +short

# Test website
curl -I https://srichakraacademy.org
```

---

## Firebase Console Links

- **Hosting Dashboard:** https://console.firebase.google.com/project/srichakraacademy-3f745/hosting/sites
- **Custom Domains:** https://console.firebase.google.com/project/srichakraacademy-3f745/hosting/sites/srichakraacademy-org

---

## Current Deployment URLs

- ✅ **Firebase Default:** https://srichakraacademy-org.web.app
- 🔄 **Custom Domain (pending):** https://srichakraacademy.org

---

## Need Help?

If you encounter issues:
1. Check Namecheap DNS propagation: https://www.whatsmydns.net/#A/srichakraacademy.org
2. Firebase Support: https://firebase.google.com/support
3. Verify your records match exactly what Firebase provides

---

**Last Updated:** October 24, 2025
**Status:** Deployed to Firebase, awaiting custom domain setup
