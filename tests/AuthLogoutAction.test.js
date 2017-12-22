jest.disableAutomock()

const App = require("../src/App")
const request = require("supertest")
const Infra = require("../src/Infra")

let app = null

beforeEach(async () => {
  const infra = await Infra({ port: 6997, env: "testing" })
  app = await App(infra)
})

afterEach(async () => {
  await app.model.user.truncate({ cascade: true })
  await app.close()
})

const dispatch = async action => {
  const result = await request(app)
    .post("/api/dispatch")
    .send(action)
    .set("Accept", "application/json")
    .expect(200)
  return result.body
}

const dispatchError = async action => {
  const result = await request(app)
    .post("/api/dispatch")
    .send(action)
    .set("Accept", "application/json")
    .expect(400)
  return result.body
}

test("Logout works with session token", async () => {
  const userID = "foo"
  const reg = await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
    password: "foobar",
    email: "foo1@bar.com",
  })

  const emailContent = app.infra.email._testSentEmails[0].content
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/)
  const verificationCode = codeMatches && codeMatches[1]

  await dispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    id: reg.authID,
    user: userID,
  })

  const loginResult = await dispatch({
    type: "AuthLoginAction",
    user: userID,
    password: "foobar",
  })
  const sessionToken = loginResult.session

  const logoutResult = await dispatch({
    type: "AuthLogoutAction",
    session: sessionToken,
  })
})

test("Logout works with logout token", async () => {
  const userID = "foo"
  const reg = await dispatch({
    type: "AuthRegisterAction",
    displayName: "Foo Bar",
    id: userID,
    password: "foobar",
    email: "foo1@bar.com",
  })

  const emailContent = app.infra.email._testSentEmails[0].content
  const codeMatches = emailContent.match(/code=([a-zA-Z0-9]*)/)
  const verificationCode = codeMatches && codeMatches[1]

  await dispatch({
    type: "AuthVerifyAction",
    code: verificationCode,
    id: reg.authID,
    user: userID,
  })

  const loginResult = await dispatch({
    type: "AuthLoginAction",
    user: userID,
    password: "foobar",
  })
  const logoutToken = loginResult.logoutToken

  const logoutResult = await dispatch({
    type: "AuthLogoutAction",
    session: logoutToken,
  })
})