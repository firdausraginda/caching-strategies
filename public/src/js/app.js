
if ('serviceWorker' in navigator) {
    navigator.serviceWorker
        // .register('/sw.js', {scope: '/help'}) this means service worker only applies on help page.
        .register('/sw.js')
        .then(function () {
            console.log('Service worker registered!');
        })
}

var deferredPrompt

window.addEventListener('beforeinstallprompt', function(event) {
    // event.preventDefault()
    deferredPrompt = event
    return false
})