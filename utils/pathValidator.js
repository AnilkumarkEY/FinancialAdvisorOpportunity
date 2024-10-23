const getPathIfQueryExists = (url) => {
    // Create a URL object to easily parse the URL
    const urlObj = new URL(url);

    if (urlObj.search) {
        return urlObj.pathname;
    }

    return null;
}

module.exports = getPathIfQueryExists;
