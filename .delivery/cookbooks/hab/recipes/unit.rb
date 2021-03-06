#
# Cookbook Name:: hab
# Recipe:: unit
#
# Copyright 2015 Chef Software, Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

execute 'make distclean' do
  cwd node['delivery']['workspace']['repo']
  environment(
    'IN_DOCKER' => 'true'
  )
  not_if { HabDocker.fresh_image?(HabDocker.devshell_name) }
end

execute 'make unit refresh=true' do
  cwd node['delivery']['workspace']['repo']
  environment(
    'IN_DOCKER' => 'true'
  )
end
