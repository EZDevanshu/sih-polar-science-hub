const researcherRepository = require('../Repositories/ResearcherRepository');
const datasetRepository = require('../Repositories/DatasetRepository');
const publicationRepository = require('../Repositories/PublicationRepository');
const stationRepository = require('../Repositories/StationRepository');

class OutreachService {
  async generateOutreachDraft(params) {
    const { researcher_id, recipient_name, recipient_institution, focus_area, objective } = params;

    let researcher = null;
    if (researcher_id) {
      researcher = await researcherRepository.findBySlugOrId(researcher_id);
    }

    const senderName = researcher ? researcher.name : 'Dr. Thamban Meloth';
    const senderInst = researcher ? researcher.institution : 'National Centre for Polar and Ocean Research (NCPOR)';
    const senderInterests = researcher ? (researcher.research_interests || []).join(', ') : 'Cryosphere & Paleoclimate';

    // Fetch relevant polar datasets and stations
    const [datasets, stations] = await Promise.all([
      datasetRepository.find({}, { limit: 3 }),
      stationRepository.findIndianStations()
    ]);

    const datasetNames = datasets.map(d => d.title).join('; ');
    const stationNames = stations.map(s => s.name).join(', ');

    const targetRecipient = recipient_name || 'Esteemed Colleague';
    const targetInst = recipient_institution || 'International Polar Institute';
    const topic = focus_area || 'Antarctic & Arctic Paleoclimatology & Southern Ocean Modeling';
    const goal = objective || 'Joint Research Proposal & Data Exchange under the Indian Polar Programme';

    const draft = `Subject: Collaborative Polar Research Invitation: ${topic}

Dear ${targetRecipient},

I hope this message finds you well at ${targetInst}.

I am writing from the ${senderInst} regarding potential research synergies in the domain of ${topic}. Our active scientific thrusts focus on ${senderInterests}, supported by state-of-the-art facilities across Indian Antarctic and Arctic research bases (${stationNames}).

Given your institution pioneering contributions, we are keen to explore collaborative avenues under our ${goal}. Our team currently operates high-resolution archives including ${datasetNames}, which could provide critical empirical ground-truth for comparative observational and modeling frameworks.

We would be delighted to arrange a brief introductory technical discussion to evaluate mutual interests, joint cruise deployments, or student exchange opportunities.

Looking forward to the prospect of fruitful collaboration.

Warm regards,

${senderName}
${senderInst}, Ministry of Earth Sciences, Govt. of India
`;

    return {
      recipient_context: {
        name: targetRecipient,
        institution: targetInst,
        topic
      },
      detected_research_interests: researcher ? researcher.research_interests : ['Ice Sheet Mass Balance', 'Paleoclimate'],
      relevant_polar_connections: {
        stations: stations.map(s => s.name),
        datasets: datasets.map(d => ({ id: d.dataset_id, title: d.title }))
      },
      generated_draft: draft,
      supporting_sources: [
        'National Centre for Polar and Ocean Research (NCPOR) Programme Directory',
        'Indian Scientific Expeditions to Antarctica (ISEA) Archive',
        'Ministry of Earth Sciences (MoES) Polar Data Policy'
      ]
    };
  }

  async getEducationalStories() {

    return [
      {
        id: 'story-1',
        title: "How Antarctic Ice Cores Reveal 800,000 Years of Earth's Climate",
        category: "Paleoclimate",
        summary: "Discover how ancient air bubbles trapped inside deep polar ice cores at Dome Fuji unlock atmospheric greenhouse gas concentrations and temperature variations from pre-industrial epochs.",
        content: "Ice core drilling at 3,810m elevation on the East Antarctic plateau provides continuous deuterium and oxygen isotope records spanning 720,000+ years, proving fundamental linkages between orbital forcing and global ice ages.",
        target_audience: "Students & Researchers",
        date: "2024"
      },
      {
        id: 'story-2',
        title: "Kongsfjorden: The Arctic Canary for Global Climate Change",
        category: "Arctic Ocean",
        summary: "How warm Atlantic water intrusion into Svalbard fjords influences glacier retreat and Arctic marine microbiology.",
        content: "India's IndARC mooring at 192m depth in Kongsfjorden fjord provides year-round continuous oceanographic telemetry monitoring the influx of Atlantic water and its effects on the Arctic ecosystem.",
        target_audience: "General Public & Educators",
        date: "2024"
      },
      {
        id: 'story-3',
        title: "Life in Polar Isolation: Wintering Over at Bharati Station",
        category: "Expedition Life",
        summary: "The psychological, physiological, and scientific realities of enduring 9 months of polar darkness in Antarctica.",
        content: "Winter-over teams of 24 scientists and engineers maintain continuous meteorological, auroral, and geomagnetic instruments while completely isolated from the outside world during the Antarctic winter.",
        target_audience: "Public & Aspiring Scientists",
        date: "2024"
      }
    ];
  }
}

module.exports = new OutreachService();

