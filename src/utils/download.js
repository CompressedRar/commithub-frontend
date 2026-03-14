

export function downloadFile(url) {
    try {
        window.open(url, "_blank", "noopener,noreferrer");
    } catch (error) {
        console.log(error)        
    }
}