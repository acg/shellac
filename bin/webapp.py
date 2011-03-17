#!/usr/bin/env python

import sys
import os
import web
import json
import string


# Initialize the web app.

urls = ( '(/.*)', 'WebApp' )
app = web.application( urls, globals() )


class WebApp:

  def __init__(self):
    pass

  def GET(self, path):

    if path == '/config/':
      web.header('Content-Type', 'application/json')
      return file('etc/shellac.json').read()
    else:
      return web.notfound()

  def POST(self, path):

    self.reconfigure()

    if path != '/action/':
      return web.notfound()

    # Validate that action is in the config.

    data = web.input()
    action = data.get('action','')
    actions = dict(map(lambda x: (x['name'],x), self.config['actions']))
    action_config = actions.get(action,'')

    if action_config == '':
      return web.notfound()

    # Get the command to run. Will be interpreted by sh -c.

    argv = ["/bin/sh","-c",action_config['command']]

    # Fork and execute the command.
    # In the child process, set up SHELLAC_* environmental vars for POST data.
    # TODO should we forkpty()? Harder for users to debug.
    # TODO should we block and waitpid() now, or try to reap processes later?

    # (pid,fd) = os.forkpty()
    pid = os.fork()

    if pid == 0:
      for key,value in data.items():
        key = key.replace(string.whitespace,"")
        key = key.replace(".","_").upper()
        key = "SHELLAC_%s" % key
        key = key.encode('utf8','ignore')
        value = value.encode('utf8','ignore')
        os.environ[key] = value
      os.execv(argv[0],argv)
    else:
      os.waitpid(pid,0)

    return ""

  def reconfigure(self):
    self.config = json.loads(file('etc/shellac.json').read())



if __name__ == '__main__':
  app.run()

