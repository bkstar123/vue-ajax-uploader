<template>
    <div class="bkstar123-vueajaxupload-container-image">
        <div class="bkstar123-vueajaxupload-progress-container-image">
            <div v-for="(file, index) in files">
                <label v-if="isUploading[index]">{{ file.name }}</label>
                <div class="progress" 
                     style="height:1.2rem"
                     v-if="isUploading[index]">
                    <div class="progress-bar progress-bar-striped" 
                         :class="progressBarColorClass[index]"
                         role="progressbar" 
                         aria-valuemin="0" 
                         aria-valuemax="100"
                         :style="{width: uploadPercentage[index] + '%'}" 
                         :aria-valuenow="uploadPercentage[index]">
                        {{ uploadPercentage[index] }}%
                    </div>
                </div> 
            </div>   
        </div>
        
        <label :for="settings.inputId">
            <slot></slot>
        </label>
        <input type="file" 
               :class="settings.inputClass"
               :id="settings.inputId" 
               :multiple="settings.multiple"
               :name="settings.inputName" 
               :ref="settings.inputId" 
               @click="resetFileUpload()"
               @change="handleFileUpload()" />
        <div role="alert"
             class="alert alert-success" 
             v-if="alerts.success.length > 0">
            <li v-for="message in alerts.success">{{ message }}</li>
        </div>
        <div role="alert"
             class="alert alert-danger" 
             v-if="alerts.error.length > 0">
            <li v-for="message in alerts.error">{{ message }}</li>
        </div>
    </div>
</template>

<script>
    export default {
        props: [
            'maxSize', 'multiple', 
            'inputName', 'inputId', 
            'progressBarColor', 'allowedExtensions', 
            'uploadUrl', 'batchSize', 'inputClass'
        ],
        data() {
            return {
                settings: {
                    inputName: 'file',
                    inputId: 'file',
                    inputClass: '',
                    multiple: false,
                    progressBarColor: 'bg-primary',
                    allowedExtensions: ['png', 'jpg', 'jpeg', 'mp4', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx', 'txt', 'pdf'],
                    uploadUrl: '/upload',
                    batchSize: 5,
                    maxSize: 5242880
                },
                files: [],
                isUploading: [],
                uploadPercentage: [],
                alerts: {
                    success: [],
                    error: []
                },
                progressBarColorClass: []
            }
        },
        created() {
            let userSettings = {
                inputName: this.inputName,
                inputId: this.inputId,
                inputClass: this.inputClass,
                multiple: this.multiple,
                progressBarColor: this.progressBarColor,
                allowedExtensions: this.allowedExtensions,
                uploadUrl: this.uploadUrl,
                batchSize: this.batchSize,
                maxSize: this.maxSize
            };
            Object.keys(userSettings).forEach(key => userSettings[key] === undefined && delete userSettings[key]);
            this.settings = Object.assign(this.settings, userSettings);
        },
        methods: {
            handleFileUpload(){
                let files = this.$refs[this.settings.inputId].files;
                this.files = Object.keys(files).map(key => files[key]);
            
                if (this.validateBatch(this.files)) {
                    this.files.forEach((file, index) => {
                        if (this.validateFile(file)) {
                            this.progressBarColorClass[index] = Object.assign({}, {
                                'bg-danger': false,
                                [this.settings.progressBarColor]: true
                            });
                            this.isUploading[index] = true;
                            this.sendFile(file, index);
                        }
                    });
                }
            },
            resetFileUpload() {
                this.isUploading = [];
                this.uploadPercentage = [];
                this.alerts.success = [];
                this.alerts.error = [];
                this.progressBarColorClass = [];
                document.getElementById(this.settings.inputId).value = '';
            },
            validateBatch(files) {
                if (files.length > this.settings.batchSize) {
                    this.alerts.error.push(`Cannot upload more than ${this.settings.batchSize} file(s)`);
                    return false;
                }
                return true;
            },
            validateFile(file) {
                let fileExtension = file.name.split('.').pop();
                if (this.settings.allowedExtensions.indexOf(fileExtension) < 0) {
                    this.alerts.error.push(`${fileExtension} is not allowed`);
                    return false;
                }

                if (file.size > this.settings.maxSize) {
                    this.alerts.error.push(`Cannot exceed upload limit of ${this.settings.maxSize} bytes`);
                    return false;
                }

                return true;
            },
            sendFile(file, index) {
                let vm = this;
                let formData = new FormData();
                formData.append(this.settings.inputName, file);
                axios.post(this.settings.uploadUrl,
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        },
                        onUploadProgress: function(progressEvent) {
                            vm.uploadPercentage[index] = parseInt(Math.round((progressEvent.loaded * 100)/progressEvent.total));
                        }
                    }
                ).then(res => {
                    if (res.data.success && typeof res.data.success === 'string') {
                        vm.alerts.success.push(res.data.success);
                    } else {
                        vm.alerts.success.push(`${file.name} has been successfully uploaded`);
                    }
                })
                 .catch(e => {
                    if (e.response.data.error && typeof e.response.data.error === 'string') {
                         vm.alerts.error.push(e.response.data.error);
                    } else {
                        vm.alerts.error.push(`${file.name} failed to be uploaded`);
                    }
                    vm.progressBarColorClass[index] = Object.assign({}, {
                        'bg-danger': true,
                        [vm.settings.progressBarColor]: false
                    });
                });
            },
        }
    }
</script>