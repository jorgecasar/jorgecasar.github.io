=begin
  Jekyll tag to filter JSON by date preprocessing with Liquid.
  Usage:
    {% json_filter result from source where attribute operator condition %}
  Example:
  	{% json_filter old_post from posts where date = before 1 year ago %}
  Dependency:
    - chronic
=end

require 'json'
require 'chronic'

module Jekyll
	class DateFilter < Liquid::Tag
		def initialize(tag_name, text, tokens)
			super			
			@text = text
		end

		def render(context)
			if /(.+) from (.+) where (.+)/.match(@text)
				result = $1.strip
				source = $2.strip
				where = $3.strip
				context[result] = Array.new
				# Parse where
				if /(.+?|\S+)\s*(=|<=|>=|<>|<|>)\s*(.*)/.match(where)
					attribute = $1
					operator = eval(':' + $2)
					condition = Chronic.parse($3)
				end
				context[source].each do |talk|
					talk_date = Chronic.parse(talk[attribute]);
				 	context[result].push(talk) if talk_date && talk_date.send(operator, condition)
				end
				context[result] = JSON context[result]
				return ''
			end
			# syntax error
			return 'ERROR:bad_datefilter_syntax'
		end
	end
end

Liquid::Template.register_tag('datefilter', Jekyll::DateFilter)