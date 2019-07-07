# vue-ajax-uploader

> A Vue plugin for the simple Ajax file uploading (single or multiple files selection). This plugin works well with any Laravel backend 5.5+.    

## 1. Installation
    npm install --save-dev @bkstar18/vue-ajax-uploader  

## 2. Requirement
- This plugin requires Bootstrap 4.x and axios package  
- If you follow Laravel's standard setup for frontend, then all things are set out of the box. Otherwise, yoi may need to manually install axios and configure it to send ```X-CSRF-TOKEN``` for every request.  

## 3. Integrate with Laravel backend

After installation, put the following code in ```resources/js/app.js```:  
```javascript
import VueAjaxUploader from '@bkstar18/vue-ajax-uploader';  
Vue.use(VueAjaxUploader);  
```

Then, compile the frontend assets: ```npm run production``` or ```npm run dev```.  

In your upload view, for example: ```resources/views/upload.blade.php```, you can use ```<bks123-file-input>```  element to render a ajax file upload input, as follows:  

```html
<bks123-file-input>Upload Files</bks123-file-input>
```

If you do not specify any attributes, then the plugin will use the following defaults:  
- ```input-name```: ```file``` => name of the file input  
- ```input-id```: ```file``` => DOM Id of the file input  
- ```input-class```: '' => class of the file input  
- ```multiple```: ```false``` => allow multiple files selection  
- ```progress-bar-color```: ```bg-primary```  => bootstrap bg color of the progress bar  
- ```allowed-extensions```: ```['png', 'jpg', 'jpeg', 'mp4', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'pdf']``` => acceptable file extensions  
- ```upload-url```: ```/upload``` => the backend URL for upload  
- ```batch-size```: 5 => maximum number of files can be uploaded  
- ```max-size```: 5242880 => maximum file size in bytes (<=> 5 MB)  


***An example for customize the default behavior***:  
```html
<bks123-file-input input-name="image" 
                   key="image"
                   input-class="form-control"
                   input-id="image-upload"
                   :multiple="true"
                   progress-bar-color="bg-success"
                   :allowed-extensions="['jpg', 'png', 'mp4']"
                   upload-url="/api/upload"
                   :batch-size="10"
                   :max-size="50*1024*1024">Upload Files</bks123-file-input>
```

**Important Note**:  
The plugin expects to receive JSON response from the backend with ```success``` key in case of success or ```error``` key in case of error.  

Sample structure of JSON responses are as follows:  
***a) Success response***  
```javascript
{
    "success": "Successfully uploaded", // mandatory key
    ...  // other key that you may add
}
```

***b) Error response***
```javascript
{
    "error": "Upload failed", // mandatory key
    ...  // other key that you may add
}
```

***Example***:
```php
<?php
...
public function upload(Request $request, FileUpload $fileupload)
{
	$data = $fileupload->handle($request, 'image', ['allowedExtensions' => ['jpg', 'png', 'jpeg']]);
	if (!$data) {
		return response()->json(['error' => $fileupload->uploadError], 422);
	}

	// Save data to database

	return response()->json(['success' => "{$data['filename']} has been uploaded", 'data' => $data], 200);
}
```


