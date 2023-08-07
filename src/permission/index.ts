function permissionEdit(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    const isEdit = String(urlParams.get("isEdit"));
    if (isEdit == "false") {
        return false;
    }
    return true
}

export default permissionEdit
