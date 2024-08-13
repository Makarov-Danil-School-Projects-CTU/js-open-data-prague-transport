let isLoading = false
let fetchedData = []

const fetchDataButton = document.getElementById('loadData')
fetchDataButton.addEventListener('click', fetchData)

async function fetchData() {
  if (isLoading) {
    return
  }

  isLoading = true
  fetchDataButton.textContent = 'Načítání dat...'
  fetchDataButton.disabled = true

  try {
    const response = await fetch(
      'https://gist.githubusercontent.com/oldamalec/26ae4abdb785a10f736a4b5ad45849db/raw/f01b1f6faa239b062dd4672d78d2d305e72cbfe9/pid-stops-2023.json'
    )
    const data = await response.json()
    fetchedData = data
    fetchDataButton.textContent = 'Aktualizovat data o zastávkách'
    
    createSearchElements()
  } catch (error) {
    alert('Chyba: ', error)
    fetchDataButton.textContent = 'Chyba, zkuste to znovu'
  } finally {
    isLoading = false
    fetchDataButton.disabled = false
  }
}

function createSearchElements() {
  const searchInput = document.createElement('input')
  searchInput.setAttribute('id', 'searchInput')

  const searchButton = document.createElement('button')
  searchButton.textContent = 'Hledej!'
  searchButton.setAttribute('id', 'searchButton')
  searchButton.disabled = true

  const solutionContainer = document.getElementById('solution')
  solutionContainer.appendChild(searchInput)
  solutionContainer.appendChild(searchButton)

  searchInput.addEventListener('input', handleOnChange)
  searchInput.addEventListener('keydown', handleEnterKey)
  searchButton.addEventListener('click', handleSearch)
}

function handleOnChange(e) {
  const searchButton = document.getElementById('searchButton')
  searchButton.disabled = !e.target.value
}

function handleEnterKey(e) {
  if (e.key === 'Enter' && e.target.value) {
    handleSearch()
  }
}

function handleSearch() {
  const inputValue = document.getElementById('searchInput').value

  if (!inputValue) {
    return
  }

  const filteredStops = fetchedData.stopGroups.filter((stop) => stop.name.includes(inputValue))
  displayStops(filteredStops)
}

function displayStops(filteredStops) {
  const stopsContainer = document.createElement('div')
  stopsContainer.setAttribute('id', 'resultsContainer')

  if (!filteredStops.length) {
    stopsContainer.textContent = 'Žádné výsledky!'
  } else if (filteredStops.length === 1) {
    showStopDetails(stopsContainer, filteredStops[0])
  } else {
    const warning = document.createElement('h2')
    warning.textContent = 'Měli jste na mysli:'
    stopsContainer.appendChild(warning)

    const resultList = document.createElement('ul')
    filteredStops.forEach((stop) => {
      const listItem = document.createElement('li')

      listItem.textContent = stop.name
      listItem.addEventListener('click', () => {
        showStopDetails(stopsContainer, stop)
      })
      
      resultList.appendChild(listItem)
    })
    stopsContainer.appendChild(resultList)
  }

  const originalContainer = document.getElementById('resultsContainer')
  if (originalContainer) {
    originalContainer.replaceWith(stopsContainer)
  } else {
    document.getElementById('solution').appendChild(stopsContainer)
  }
}

function showStopDetails(container, stop) {
  container.innerHTML = ''

  const detailsContainer = document.createElement('div')

  const stationName = document.createElement('h2')
  stationName.textContent = stop.name
  detailsContainer.appendChild(stationName)

  const stopsArr = stop.stops

  stopsArr.forEach((platform, index) => {
    const platformLabel = document.createElement('p')
    platformLabel.innerHTML = `<a href="https://www.google.com/maps?q=${platform.lat},${
      platform.lon
    }" target="_blank">Nástupiště ${index + 1}</a>`

    detailsContainer.appendChild(platformLabel)

    const linesList = document.createElement('ul')
    platform.lines.forEach((line) => {
      const listItem = document.createElement('li')
      listItem.textContent = `${line.type} ${line.name} → ${line.direction}`
      
      linesList.appendChild(listItem)
    })
    detailsContainer.appendChild(linesList)
  })

  container.appendChild(detailsContainer)
}
