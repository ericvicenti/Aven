const { initTestApp, setupTestUserSession } = require("./TestUtilities")

let app = null
const fs = require("fs-extra")
const { join } = require("path")
const FSClient = require("../src/FSClient")

beforeEach(async () => {
  app = await initTestApp()
  await setupTestUserSession(app)
  await fs.mkdir("__testDir")
  await fs.writeFile("__testDir/foo.txt", "foo")
  await fs.writeFile("__testDir/hello.txt", "good news, everybody!")
  await fs.mkdir("__testDir/foo")
  await fs.writeFile("__testDir/foo/goodnews.txt", "good news, foo!")
})

afterEach(async () => {
  await app.closeTest()
  await fs.remove("__testDir")
})

test("Can checksum files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt")
  const checksum = await FSClient.checksumFile(sourceFile)
  expect(checksum).toBe("ce7929f1bee232db4c73542c06ed42ee7a5e0679")
})

test("Can checksum folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir")
  const checksum = await FSClient.checksumPath(sourceFolder)
  expect(checksum).toBe("bf21a9e8fbc5a3846fb05b4fa0859e0917b2202f")
})

test("Can upload files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt")
  const docID = await FSClient.checksumFile(sourceFile)
  await app.testDispatch({
    type: "SetRecordAction",
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "fooFile",
    permission: "PUBLIC",
    doc: null,
    owner: app.testAuthUser,
  })
  const uploadResult = await FSClient.uploadFile(sourceFile, {
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "fooFile",
  })
  expect(uploadResult.docID).toBe(docID)
})

test("Can upload folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir")
  const docID = await FSClient.checksumDirectory(sourceFolder)
  await app.testDispatch({
    type: "SetRecordAction",
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "fooFolder",
    permission: "PUBLIC",
    doc: null,
    owner: app.testAuthUser,
  })
  const uploadResult = await FSClient.uploadPath(sourceFolder, {
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    recordID: "fooFolder",
  })
  expect(uploadResult.docID).toBe(docID)
})