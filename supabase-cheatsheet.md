 # Supabase Cheatsheet

## Setup

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'YOUR_SUPABASE_URL',
  'YOUR_SUPABASE_ANON_KEY'
);
```

## Authentication

### Sign Up

```javascript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign In

```javascript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123',
});
```

### Sign Out

```javascript
const { error } = await supabase.auth.signOut();
```

### Get Current User

```javascript
const { data: { user } } = await supabase.auth.getUser();
```

### Listen to Auth Changes

```javascript
supabase.auth.onAuthStateChange((event, session) => {
  console.log(event, session);
});
```

## Database (CRUD)

### Insert

```javascript
const { data, error } = await supabase
  .from('users')
  .insert({ name: 'John', age: 30 });
```

### Select All

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*');
```

### Select Specific Columns

```javascript
const { data, error } = await supabase
  .from('users')
  .select('id, name, email');
```

### Select with Filter

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('age', 30);
```

### Select with Multiple Filters

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .gte('age', 18)
  .lt('age', 65);
```

### Update

```javascript
const { data, error } = await supabase
  .from('users')
  .update({ name: 'Jane' })
  .eq('id', 1);
```

### Delete

```javascript
const { data, error } = await supabase
  .from('users')
  .delete()
  .eq('id', 1);
```

### Order & Limit

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .order('created_at', { ascending: false })
  .limit(10);
```

### Search

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*')
  .ilike('name', '%john%');
```

## Realtime Subscriptions

### Subscribe to Changes

```javascript
const channel = supabase
  .channel('users-channel')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'users' },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

### Unsubscribe

```javascript
supabase.removeChannel(channel);
```

## Storage

### Upload File

```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload('path/filename.png', file);
```

### Download File

```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .download('path/filename.png');
```

### Get Public URL

```javascript
const { data } = supabase.storage
  .from('bucket-name')
  .getPublicUrl('path/filename.png');
```

### Delete File

```javascript
const { data, error } = await supabase.storage
  .from('bucket-name')
  .remove(['path/filename.png']);
```

## Common Filters

| Filter | Usage |
|--------|-------|
| `.eq('column', value)` | Equal to |
| `.neq('column', value)` | Not equal to |
| `.gt('column', value)` | Greater than |
| `.gte('column', value)` | Greater than or equal |
| `.lt('column', value)` | Less than |
| `.lte('column', value)` | Less than or equal |
| `.like('column', '%pattern%')` | Case-sensitive pattern match |
| `.ilike('column', '%pattern%')` | Case-insensitive pattern match |
| `.in('column', [val1, val2])` | In array |
| `.is('column', null)` | Is null |
| `.not('column', 'is', null)` | Is not null |

## Error Handling

```javascript
const { data, error } = await supabase
  .from('users')
  .select('*');

if (error) {
  console.error('Error:', error.message);
} else {
  console.log('Data:', data);
}
```

## Supabase CLI

### Installation

```powershell
# Install globally
npm install -g supabase

# Or use npx
npx supabase --version
```

### Project Setup

#### Initialize Project

```bash
supabase init
```

#### Start Local Development

```bash
supabase start
```

#### Stop Local Development

```bash
supabase stop
```

#### Check Status

```bash
supabase status
```

### Database Migrations

#### Create New Migration

```bash
supabase migration new migration_name
```

#### Apply Migrations

```bash
supabase db push
```

#### Reset Database

```bash
supabase db reset
```

#### Pull Remote Schema

```bash
supabase db pull
```

#### Generate Types

```bash
supabase gen types typescript --local > types/database.ts
```

### Functions (Edge Functions)

#### Create New Function

```bash
supabase functions new function-name
```

#### Serve Functions Locally

```bash
supabase functions serve
```

#### Deploy Function

```bash
supabase functions deploy function-name
```

#### Delete Function

```bash
supabase functions delete function-name
```

### Link & Deploy

#### Link to Remote Project

```bash
supabase link --project-ref your-project-ref
```

#### Deploy Database Changes

```bash
supabase db push
```

#### Deploy All

```bash
supabase db push
supabase functions deploy
```

### Storage

#### List Buckets

```bash
supabase storage list
```

#### Create Bucket

```bash
supabase storage create bucket-name
```

### Secrets Management

#### Set Secret

```bash
supabase secrets set SECRET_NAME=value
```

#### List Secrets

```bash
supabase secrets list
```

#### Unset Secret

```bash
supabase secrets unset SECRET_NAME
```

### Testing

#### Run Tests

```bash
supabase test db
```

### Common Workflows

#### Local Development Setup

```bash
supabase init
supabase start
supabase status  # Get local credentials
```

#### Create & Apply Migration

```bash
supabase migration new add_users_table
# Edit the migration file
supabase db reset  # Apply all migrations
```

#### Generate TypeScript Types

```bash
supabase gen types typescript --local > src/types/database.ts
```

#### Deploy to Production

```bash
supabase link --project-ref your-ref
supabase db push
supabase functions deploy
```

// Check if username is available
const { data, error } = await supabase
  .from('profiles')
  .select('username')
  .eq('username', 'desired_username')
  .maybeSingle();

if (data) {
  // Username taken
} else {
  // Username available
}

const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      username: 'cooluser123'
    }
  }
});