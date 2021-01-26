const fetch = require("node-fetch")
const express = require('express')
const app = express()
const port = 3000

const clientId = process.argv[2]
const clientSecret = process.argv[3]

app.use(express.static('public'))

app.get('/clientId', (req, res) => {
  res.send(JSON.stringify({ clientId }))
})

app.get('/logout', (req, res) => {
  res.redirect(`http://localhost:3000`)
})

app.get('/oauth2callback', handleOAuth2)
async function handleOAuth2(req, res) {
  const tokenResponse = await fetch(
    `https://www.googleapis.com/oauth2/v4/token`,
    {
      method: 'POST',
      body: JSON.stringify({
        code: req.query.code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: 'http://localhost:3000/oauth2callback',
        grant_type: 'authorization_code'
      })
    }
  )
  const tokenJson = await tokenResponse.json()
  const userInfo = await getUserInfo(tokenJson.access_token)

  res.redirect(`http://localhost:3000?${Object.keys(userInfo).map(key => `${key}=${encodeURIComponent(userInfo[key])}`).join('&')}`)
}

async function getUserInfo(accessToken) {
  const response = await fetch(
    `https://www.googleapis.com/oauth2/v1/userinfo?access_token=${accessToken}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  )
  const json = await response.json()
  return json
}

async function getPlusInfo(accessToken) {
    const response = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/labels`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )
    const json = await response.json()
    return json
  }

app.listen(port, () => console.log(`App listening on port ${port}!`))