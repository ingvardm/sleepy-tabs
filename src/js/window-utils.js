export function getAllWindows() {
    return new Promise(resolve => {
        chrome.windows.getAll(resolve)
    })
}