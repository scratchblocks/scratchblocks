const fs = require("fs")
const path = require("path")
const { spawnSync } = require("child_process")

const SNAPSHOTS = "./snapshots"
const SNAPSHOT_DIFFS = "./snapshot-diffs"

if (process.env.GITHUB_WORKSPACE) process.chdir(process.env.GITHUB_WORKSPACE)

const gitStatus = spawnSync("git", ["status"], {
  encoding: "utf-8",
}).stdout
const modifiedSnapshotFiles = Array.from(
  gitStatus.matchAll(/^\s*modified:\s*snapshots\/([\w-/]+)\.png$/gm),
  ([_, filename]) => filename
)
const modifiedSnapshotFilesDisplay = modifiedSnapshotFiles.map(
  filename => `- \`${filename}\``
)
if (modifiedSnapshotFiles.length === 0) process.exit(0)
const output = `Warning: The commit caused the following snapshots to output a different image:
${modifiedSnapshotFilesDisplay.join("\n")}

While this is sometimes intended, this often indicates a regression in the
rendering code. To resolve this, first run \`npm run snapshots\` locally
(or download the attached artifact that contains old and new images) and
check the old and new files; if the changes are either unnoticeable or
intended, commit and push the new files. If not, then fix the regression and
run the snapshot test again.`

console.warn(output)
process.exitCode = 1

fs.rmSync(SNAPSHOT_DIFFS, {
  recursive: true,
  force: true,
})
fs.mkdirSync(SNAPSHOT_DIFFS)

const copyFiles = suffix => {
  for (const file of modifiedSnapshotFiles) {
    const srcpath = path.join(SNAPSHOTS, `${file}.png`)
    const dstpath = path.join(SNAPSHOT_DIFFS, `${file}-${suffix}.png`)
    try {
      fs.mkdirSync(path.dirname(dstpath))
    } catch {}
    fs.copyFileSync(srcpath, dstpath)
  }
}

copyFiles("new")
spawnSync("git", ["stash", "push", "--", `${SNAPSHOTS}/**/*.png`])
copyFiles("old")
spawnSync("git", ["stash", "pop"])
