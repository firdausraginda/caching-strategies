var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form')
var titleInput = document.querySelector('#title')
var locationInput = document.querySelector('#location')

function openCreatePostModal() {
  createPostArea.style.display = 'block';

  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt = null
  }

  // how to unregsiter service worker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //     .then(function (registrations) {
  //       for (var i = 0; i < registrations.length; i++) {
  //         registrations[i].unregister()
  //       }
  //     })
  // }

}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// cache on demand
// function onSaveButtonClicked(event) {
//   console.log('clicked');
//   if ('caches' in window) {
//     caches.open('user-requested')
//       .then(function(cache){
//         cache.add('https://httpbin.org/get')
//         cache.add('/src/images/sf-boat.jpg')
//       })
//   }
// }

function clearCards() {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild)
  }
}

function createCard(data) {
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked)
  // cardSupportingText.appendChild(cardSaveButton)
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data) {
  clearCards()
  for (var i = 0; i < data.length; i++) {
    createCard(data[i])
  }
}

// --------cache then network--------
var url = 'https://pwagram-877dc.firebaseio.com/posts.json'
var networkDataReceived = false

fetch(url)
  .then(function (res) {
    return res.json();
  })
  .then(function (data) {
    networkDataReceived = true
    console.log('from web', data);
    var dataArr = []
    for (var key in data) {
      dataArr.push(data[key])
    }
    updateUI(dataArr)
  });

if ('caches' in window) {
  caches.match(url)
    .then(function (response) {
      if (response) {
        return response.json()
      }
    })
    .then(function (data) {
      console.log('from cache', data);
      if (!networkDataReceived) {
        var dataArr = []
        for (var key in data) {
          dataArr.push(data[key])
        }
        updateUI(dataArr)
      }
    })
}

function sendData() {
  fetch('https://pwagram-877dc.firebaseio.com/posts.json', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/pwagram-877dc.appspot.com/o/8b26e399-61ea-49f2-8cc3-b5ba96572037_43.jpeg?alt=media&token=7e711692-c4e7-48e5-8594-2a63fe89e620'
    })
  })
    .then(function (res) {
      console.log('send data', res);
    })
}

form.addEventListener('submit', function (event) {
  event.preventDefault()

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('please enter valid data')
    return
  }

  closeCreatePostModal()

  sendData()
})