function toast(type, message, options) {
    if (siiimpleToast) {
        siiimpleToast[type](message, options)
    }
}
