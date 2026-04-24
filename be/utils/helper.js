const {google} = require('googleapis');
const {createClient} = require('@supabase/supabase-js');
const supabaseUrl=process.env.SUPABASE_URL;
const supabaseKey=process.env.SUPABASE_SECRET_KEY;
const supabaseClient=createClient(supabaseUrl,supabaseKey);

function getOAuthClient() {
  return new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);
}

async function uploadImage(file,userId){
    try{
        const { data, error } = await supabaseClient.storage
            .from('ProfilePics')
            .upload(`${userId}/${Date.now()}-${file.originalname}`, file.buffer, {
                contentType: 'image/png',
                upsert:false
            });

        if (error) {
            console.log("Supabase Upload Error: ", error);
            return {
                status: 'error',
                message: 'File upload failed',
                data:null
            };
        }

        else{
            return{
                status:'success',
                message:'File uploaded successfully',
                data:data,
            }
        }
        
    }catch(err){
        throw new Error(err);
    }
}

function extractJSON(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON found");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    throw new Error("Invalid JSON format from AI");
  }
}

const encode = (str) => (str != null ? Buffer.from(str).toString('base64') : undefined);
const decode = (str) => (str        ? Buffer.from(str, 'base64').toString() : null);

module.exports={
    getOAuthClient,
    uploadImage,
    extractJSON,
    encode,
    decode
}