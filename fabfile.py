from fabric import Connection, task
import requests
import re

RELEASE_ENDPOINT = "https://api.github.com/repos/f-klubben/fappen/releases/latest"

@task
def deploy_latest_release(c, workdir=None):
    if workdir is None:
        print("No working directory supplied.")
        return

    res = requests.get(RELEASE_ENDPOINT)
    json = res.json()

    release = []
    for asset in json['assets']:
        if re.fullmatch(r"build-.*\.tar\.gz", asset['name']) is not None:
            release.append(asset)

    if len(release) == 0:
        print("No suitable build archive found for latest release")
        return

    print("Archives:")
    for i in range(0, len(release)):
        print(f"{i}) {release[i]['name']}")

    release_id = input("Select a release archive: ")
    release_id = int(release_id)

    release = release[release_id]

    with c.cd(workdir):
        c.run(f'curl -L0 {release["browser_download_url"]} --output build.tar.gz')
        c.run('tar -xf build.tar.gz')
        c.run('rm -f build.tar.gz')

