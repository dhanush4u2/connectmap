# ⚠️ CRITICAL: Your Firebase Document is Incomplete!

## The Problem

Looking at your Firebase screenshot, your `place-001` document only has **4 fields**:
- ✅ address
- ✅ category
- ✅ description
- ✅ title

But the app expects **ALL these fields**:
- ❌ **status** (CRITICAL - must be "published")
- ❌ **location** (CRITICAL - must have lat/lng)
- ❌ avgRating
- ❌ tags (array)
- ❌ images (array)
- ❌ reactionCount (object)
- ❌ city
- ❌ neighbourhood
- ❌ createdBy
- ❌ contributors
- ❌ meta

---

## 🔴 Why App is Blank

The query is looking for places where `status == 'published'` but your document has NO status field!

```typescript
where('status', '==', 'published')  // ❌ Returns 0 results!
```

Also, `location` field is **required** for the map to show markers.

---

## ✅ Quick Fix: Add Missing Fields

1. Go to your document: https://console.firebase.google.com/project/connectrockin/firestore/data/places/place-001

2. Click **"+ Add field"** for EACH of these:

### Required Fields (Add These NOW):

| Field Name | Type | Value |
|------------|------|-------|
| **status** | string | `published` |
| **location** | map | (see below) |
| avgRating | number | `4.5` |
| city | string | `Bengaluru` |
| neighbourhood | string | `Indiranagar` |
| createdBy | string | `manual` |
| tags | array | (see below) |
| images | array | (leave empty) |
| contributors | array | (leave empty) |
| reactionCount | map | (see below) |
| meta | map | (see below) |

### For "location" (map type):
Add field name: `location`, type: `map`
Then add these sub-fields:
- `lat` (number): `12.9784`
- `lng` (number): `77.6408`

### For "tags" (array type):
Add field name: `tags`, type: `array`
Then add these items (all type: string):
- `coffee`
- `late-night`
- `vibes`

### For "reactionCount" (map type):
Add field name: `reactionCount`, type: `map`
Then add these sub-fields:
- `like` (number): `0`
- `love` (number): `0`
- `save` (number): `0`

### For "meta" (map type):
Add field name: `meta`, type: `map`
Then add these sub-fields:
- `views` (number): `0`
- `featuredScore` (number): `0`

---

## ✅ Or... Delete and Recreate

**EASIER OPTION:** Delete the incomplete document and create a new one properly.

1. Delete `place-001`
2. Click **"Add document"**
3. Click the **three dots (⋮)** → Look for JSON import option
4. OR add fields one by one following the table above

---

## 🎯 After Adding All Fields

1. **Refresh your browser** at http://localhost:5174
2. **Open Console** (F12) and look for:
   - `✅ Fetched 1 places from Firestore`
   - You should see the marker appear on the map!

The error boundary and debug logs I just added will now show you EXACTLY what's wrong.
