const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
  try {
    console.log('Setting up Supabase Storage...');
    
    // Check if the images bucket already exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const imagesBucket = buckets.find(bucket => bucket.name === 'images');
    
    if (imagesBucket) {
      console.log('✅ Images bucket already exists');
    } else {
      console.log('Creating images bucket...');
      
      // Create the images bucket
      const { data: bucket, error: createError } = await supabase.storage.createBucket('images', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
        fileSizeLimit: 5242880 // 5MB
      });

      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }

      console.log('✅ Images bucket created successfully');
    }

    // Set up RLS policies for the images bucket
    console.log('Setting up storage policies...');
    
    // Policy to allow public read access to images
    const { error: readPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'images',
      policy_name: 'Public read access',
      policy_definition: 'SELECT true'
    });

    if (readPolicyError && !readPolicyError.message.includes('already exists')) {
      console.error('Error creating read policy:', readPolicyError);
    } else {
      console.log('✅ Public read policy set up');
    }

    // Policy to allow authenticated users to upload images
    const { error: uploadPolicyError } = await supabase.rpc('create_storage_policy', {
      bucket_name: 'images',
      policy_name: 'Authenticated upload access',
      policy_definition: 'SELECT true WHERE auth.role() = \'authenticated\''
    });

    if (uploadPolicyError && !uploadPolicyError.message.includes('already exists')) {
      console.error('Error creating upload policy:', uploadPolicyError);
    } else {
      console.log('✅ Upload policy set up');
    }

    console.log('\n🎉 Supabase Storage setup complete!');
    console.log('You can now upload images through the admin interface.');
    
    // Test the bucket
    console.log('\nTesting bucket access...');
    const { data: testList } = await supabase.storage.from('images').list();
    console.log(`Bucket contains ${testList?.length || 0} files`);

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

setupStorage(); 