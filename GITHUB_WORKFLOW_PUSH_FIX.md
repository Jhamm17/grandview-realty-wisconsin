# Fix: GitHub Workflow Push Permission Error

## The Problem

You're getting this error:
```
refusing to allow an OAuth App to create or update workflow `.github/workflows/refresh-cache.yml` without `workflow` scope
```

This happens because GitHub requires special permissions to modify workflow files for security reasons.

## Solution Options

### Option 1: Use SSH Instead of HTTPS (Easiest)

If you're using HTTPS, switch to SSH:

1. **Check your current remote:**
   ```bash
   git remote -v
   ```

2. **If it shows HTTPS (https://github.com/...), switch to SSH:**
   ```bash
   git remote set-url origin git@github.com:Jhamm17/grandview-realty-wisconsin.git
   ```

3. **Try pushing again:**
   ```bash
   git push origin main
   ```

**Note:** Make sure you have SSH keys set up with GitHub. If not, see: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

---

### Option 2: Update Your Personal Access Token

If you're using a Personal Access Token (PAT):

1. **Go to GitHub Settings:**
   - https://github.com/settings/tokens
   - Or: Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Create a new token or edit existing one:**
   - Click "Generate new token" → "Generate new token (classic)"
   - Or edit your existing token

3. **Select scopes:**
   - ✅ **repo** (full control of private repositories)
   - ✅ **workflow** (Update GitHub Action workflows) ← **This is the key one!**

4. **Generate and copy the token**

5. **Update your Git credentials:**
   ```bash
   # Remove old credentials
   git credential-osxkeychain erase
   host=github.com
   protocol=https
   
   # Or just push again and enter new token when prompted
   git push origin main
   ```

---

### Option 3: Use GitHub CLI (gh)

If you have GitHub CLI installed:

```bash
# Authenticate
gh auth login

# Then push normally
git push origin main
```

---

### Option 4: Push via GitHub Web Interface (Temporary Workaround)

If you need to get the file up quickly:

1. Go to your repository on GitHub
2. Navigate to `.github/workflows/` folder
3. Click "Add file" → "Create new file"
4. Name it: `refresh-cache.yml`
5. Copy the contents from the file I created
6. Click "Commit new file"

---

## Recommended: Use SSH (Option 1)

SSH is the easiest long-term solution. Here's how to set it up if you haven't:

### Check if you have SSH keys:

```bash
ls -al ~/.ssh
```

Look for files named `id_rsa.pub` or `id_ed25519.pub`

### If you don't have SSH keys, create them:

```bash
ssh-keygen -t ed25519 -C "your_email@example.com"
```

Press Enter to accept default file location, then enter a passphrase (optional).

### Add SSH key to GitHub:

1. **Copy your public key:**
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the entire output.

2. **Add to GitHub:**
   - Go to: https://github.com/settings/keys
   - Click "New SSH key"
   - Paste your key
   - Click "Add SSH key"

3. **Test the connection:**
   ```bash
   ssh -T git@github.com
   ```
   You should see: "Hi Jhamm17! You've successfully authenticated..."

4. **Update your remote URL:**
   ```bash
   git remote set-url origin git@github.com:Jhamm17/grandview-realty-wisconsin.git
   ```

5. **Push again:**
   ```bash
   git push origin main
   ```

---

## Quick Fix (Right Now)

The fastest solution right now:

1. **Switch to SSH:**
   ```bash
   git remote set-url origin git@github.com:Jhamm17/grandview-realty-wisconsin.git
   git push origin main
   ```

If that doesn't work (no SSH keys), use the web interface (Option 4) to create the file manually.

---

## Verify It Worked

After pushing, check:

1. Go to your GitHub repository
2. Click the **"Actions"** tab
3. You should see **"Refresh Property Cache"** workflow listed
4. If you see it, you're all set! ✅

---

## Need More Help?

If you're still having issues:
- Check GitHub's docs: https://docs.github.com/en/authentication
- Make sure you have push access to the repository
- Verify you're the repository owner or have admin access
