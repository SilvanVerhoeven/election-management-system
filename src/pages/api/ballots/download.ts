import mime from "mime"
import { api } from "src/blitz-server"
import getElections from "../basis/queries/getElections"
import { downloadBallot, getBallotFileName, getBallotFileType } from "./[electionId]"
import PizZip from "pizzip"

export default api(async (req, res, ctx) => {
  if (req.method !== "GET") {
    res.status(405).send({ error: "Method not allowed" })
    return
  }

  const elections = await getElections(null, ctx)
  const ballots = await Promise.all(
    elections.map(async (election) => await downloadBallot(election, ctx))
  )

  const zip = new PizZip()

  for (let i = 0; i < ballots.length; i++) {
    const election = elections[i]
    const ballot = ballots[i]
    if (!!ballot && !!election) {
      const filename = `${getBallotFileName(election)}.${getBallotFileType()}`
      console.log(filename)
      zip.file(filename, ballot)
    }
  }

  let blob = zip.generate({ type: "nodebuffer" })

  const now = new Date()
  const dateTimeString = `${now.getFullYear()}${now.getMonth()}${now.getDate()}${now.getHours()}${now.getMinutes()}${now.getSeconds()}`

  res
    .setHeader("content-disposition", `attachment; filename="stimmzettel_${dateTimeString}.zip"`)
    .setHeader("content-type", mime.getType("zip") || "")
    .send(blob)
})
