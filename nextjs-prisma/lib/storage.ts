import ImageKit from "imagekit";

const imagekit = new ImageKit({
    publicKey : process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey : process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint : process.env.IMAGEKIT_URL_ENDPOINT!
}) 

export async function uploadFiles(
    file : string | Buffer,
    fileName : string,
    folder : string = "uploads",
){
    try {
        console.log(`Uploading file: ${fileName} to folder ${folder}`)

        const result = await imagekit.upload({
            file : file,
            fileName: fileName,
            folder : folder,
            useUniqueFileName: true,
        })

        console.log("Upload Successful:" , result.url);
        return result.url;
    } catch (error) {
        console.log("ImageKit upload error:" , error);
        throw new Error("Failed to upload the file to Imagekit")        
    }
}

export async function deleteFile(fileUrl: string){
    try {
        console.log("Deleting files" , fileUrl);

        const urlParts = fileUrl.split("/")
        const fileId = urlParts[urlParts.length - 1].split("?")[0]

        if(!fileId){
            throw new Error("Invalid file URL - can not extract file ID")
        }

        const files = await imagekit.listFiles({
            searchQuery: `name=${fileId}`
        })

       if (files.length === 0) {
    console.log("File not found in ImageKit");
    return false;
}

const file = files[0];
if ('fileId' in file) {
    await imagekit.deleteFile(file.fileId);
    console.log("File Deleted Successfully");
    return true;
} else {
    console.log("Invalid file object in the array");
    return false;
}
        
    } catch (error) {
        console.log("ImageKit delete error" , error);
        return false;
        
    }
}

export {ImageKit}