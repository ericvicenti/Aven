const { initTestApp, setupTestUserSession } = require("./TestUtilities")

let app = null
let client = null
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
  client = FSClient({
    dispatch: app.testDispatch,
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
  })
})

afterEach(async () => {
  await app.closeTest()
  await fs.remove("__testDir")
})

test("checksumFile - Can checksum files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt")
  const checksum = await client.checksumFile(sourceFile)
  expect(checksum).toBe("ce7929f1bee232db4c73542c06ed42ee7a5e0679")
})

test("checksumPath - Can checksum folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir")
  const checksum = await client.checksumPath(sourceFolder)
  expect(checksum).toBe("35e684b0c8ec1880aa46ca68b6074335eb268943")
})

test("putFile - Can put files", async () => {
  const sourceFile = join(__dirname, "../__testDir/foo.txt")
  const docID = await client.checksumFile(sourceFile)
  await app.testDispatch({
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    type: "SetRecordAction",
    recordID: "fooFile",
    permission: "PUBLIC",
    doc: null,
    owner: app.testAuthUser,
  })
  const putResult = await client.putFile(sourceFile, "fooFile")
  expect(putResult.docID).toBe(docID)
})

test("putPath - Can put folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir")
  const docID = await client.checksumDirectory(sourceFolder)
  await app.testDispatch({
    authUser: app.testAuthUser,
    authSession: app.testAuthSession,
    type: "SetRecordAction",
    recordID: "fooFolder",
    permission: "PUBLIC",
    doc: null,
    owner: app.testAuthUser,
  })
  const putResult = await client.putPath(sourceFolder, "fooFolder")
  expect(putResult.docID).toBe(docID)
})

test("uploadPath - Can upload folder", async () => {
  const sourceFolder = join(__dirname, "../__testDir")
  const docID = await client.checksumDirectory(sourceFolder)
  const uploadResult = await client.uploadPath(sourceFolder, "fooFolder")
  expect(uploadResult.docID).toBe(docID)
})

test("downloadPath - Can download folder after upload", async () => {
  const sourceFolder = join(__dirname, "../__testDir")
  const sourceChecksum = await client.checksumDirectory(sourceFolder)
  const uploadResult = await client.uploadPath(sourceFolder, "fooFolder")
  await fs.remove(sourceFolder)
  const downloadResult = await client.downloadPath(sourceFolder, "fooFolder")
  const downloadedChecksum = await client.checksumDirectory(sourceFolder)
  expect(downloadedChecksum).toBe(sourceChecksum)
})