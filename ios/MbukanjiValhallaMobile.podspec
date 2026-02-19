require 'json'

package = JSON.parse(File.read(File.join(__dir__, '..', 'package.json')))

Pod::Spec.new do |s|
  s.name         = 'MbukanjiValhallaMobile'
  s.version      = package['version']
  s.summary      = package['description']
  s.homepage     = 'https://github.com/janitdevelopers/JanPAMS'
  s.license      = 'MIT'
  s.authors      = { 'JanPAMS' => 'janpams@example.com' }
  s.platforms    = { :ios => '13.0' }
  s.source       = { :git => 'https://github.com/janitdevelopers/JanPAMS.git', :tag => "#{s.version}" }
  s.source_files = '**/*.{h,m,mm}'
  s.requires_arc = true
  s.dependency 'React-Core'
end
