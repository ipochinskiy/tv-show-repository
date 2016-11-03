const request = require('request-promise-native');
const xml2js = require('xml2js');

const parser = new xml2js.Parser({
	explicitArray: false,
	normalizeTags: true,
});

const baseUrl = 'http://thetvdb.com';
const postersUrl = `${baseUrl}/banners`;
const apiUrl = `${baseUrl}/api`;

// TODO: move it into config
const apiKey = '9EF1D1E7D28FDA0B';

const parseXml = xml => new Promise((resolve, reject) =>
	parser.parseString(xml, (err, res) => {
		if (err) {
			reject(err);
		}
		resolve(res);
	})
);

module.exports = {
	searchSeriesByName: ({ seriesName }) => request
		.get(`${apiUrl}/GetSeries.php?seriesname=${seriesName}`)
		.then(body => parseXml(body)),

	getSeriesInfo: ({ seriesId }) => request
		.get(`${apiUrl}/${apiKey}/series/${seriesId}/all/en.xml`)
		.then(body => parseXml(body)),

	loadPoster: ({ poster }) => request({
		url: `${postersUrl}/${poster}`,
		encoding: null,
		resolveWithFullResponse: true,
	}).then(response => {
		const type = response.headers['content-type'];
		const base64 = response.body.toString('base64');
		return `data:${type};base64,${base64}`;
	}),
};
