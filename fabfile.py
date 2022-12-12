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

    release = None
    for asset in json['assets']:
        if re.fullmatch(r"build-.*\.tar\.gz", asset['name']) is not None:
            release = asset['browser_download_url']
            break

    if release is None:
        print("No suitable build archive found for latest release")
        return

    with c.cd(workdir):
        c.run(f'curl -L0 {release} --output build.tar.gz')
        c.run('tar -xf build.tar.gz')
        c.run('rm -f build.tar.gz')

