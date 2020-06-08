import {Base64UploadAdapter} from '@ckeditor/ckeditor5-upload/src/adapters/base64uploadadapter';

function editor()
{
   
   ClassicEditor.create(document.getElementById('cuerpo'), { image: {
      upload: "png"
  }});
}