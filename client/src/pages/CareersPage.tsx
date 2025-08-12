/**
 * CAREERS PAGE - Dynamic Version
 * 
 * Versione dinamica della pagina "Lavora con Noi" che utilizza l'API
 * per caricare posizioni lavorative e gestire candidature.
 */

import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";
import ContactCTA from "../components/common/ContactCTA";
import PageHero from "../components/common/PageHero";
import { useJobs, type JobPosition } from "../hooks/useJobs";
import toast from "react-hot-toast";
import {
  MapPin,
  Clock,
  Building,
  User,
  DollarSign,
  Calendar,
  Upload,
  X,
} from "lucide-react";

const CareersContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-x: hidden;
  background: #1a1a1a;
  color: #ffffff;
`;

const MainContent = styled.main`
  flex: 1;
  width: 100%;
  padding-top: 110px;

  @media (max-width: 1024px) {
    padding-top: 100px;
  }

  @media (max-width: 768px) {
    padding-top: 80px;
  }

  @media (max-width: 480px) {
    padding-top: 70px;
  }
`;

const ContentSection = styled.section`
  padding: 80px 0;
  background: #1a1a1a;

  @media (max-width: 768px) {
    padding: 60px 0;
  }

  @media (max-width: 480px) {
    padding: 40px 0;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;

  @media (max-width: 768px) {
    padding: 0 15px;
  }
`;

const IntroSection = styled.div`
  text-align: center;
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }

  @media (max-width: 480px) {
    margin-bottom: 50px;
  }

  h2 {
    font-size: 2.5rem;
    color: #ffffff;
    margin-bottom: 30px;
    font-family: "Korsvagen Brand", "Times New Roman", serif;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 2rem;
      margin-bottom: 25px;
    }

    @media (max-width: 480px) {
      font-size: 1.8rem;
      margin-bottom: 20px;
    }
  }

  p {
    font-size: 1.2rem;
    color: #cccccc;
    line-height: 1.7;
    max-width: 700px;
    margin: 0 auto;
    font-family: "Inter", "Segoe UI", sans-serif;

    @media (max-width: 768px) {
      font-size: 1.1rem;
    }

    @media (max-width: 480px) {
      font-size: 1rem;
    }
  }
`;

const FiltersSection = styled.div`
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterSelect = styled.select`
  padding: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: #ffffff;
  font-family: "Inter", "Segoe UI", sans-serif;
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4caf50;
    background: rgba(255, 255, 255, 0.1);
  }

  option {
    background: #2a2a2a;
    color: #ffffff;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
  color: #cccccc;
  font-size: 1.2rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #cccccc;

  h3 {
    margin-bottom: 1rem;
    color: #ffffff;
    font-size: 1.5rem;
  }

  p {
    font-size: 1.1rem;
    line-height: 1.6;
  }
`;

const BenefitsSection = styled.div`
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }

  @media (max-width: 480px) {
    margin-bottom: 50px;
  }

  h3 {
    font-size: 2rem;
    color: #ffffff;
    margin-bottom: 40px;
    text-align: center;
    font-family: "Korsvagen Brand", "Times New Roman", serif;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 35px;
    }

    @media (max-width: 480px) {
      font-size: 1.6rem;
      margin-bottom: 30px;
    }
  }

  .benefits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 30px;
    margin-top: 40px;

    @media (max-width: 768px) {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 25px;
    }

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
      gap: 20px;
    }

    .benefit-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      padding: 30px;
      text-align: center;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .benefit-icon {
        font-size: 3rem;
        margin-bottom: 20px;
        color: #4caf50;
      }

      h4 {
        font-size: 1.3rem;
        color: #ffffff;
        margin-bottom: 15px;
        font-family: "Korsvagen Brand", "Times New Roman", serif;
        font-weight: 400;
        letter-spacing: 0.02em;
      }

      p {
        font-size: 1rem;
        color: #cccccc;
        line-height: 1.6;
        margin: 0;
        font-family: "Inter", "Segoe UI", sans-serif;
      }
    }
  }
`;

const PositionsSection = styled.div`
  margin-bottom: 80px;

  @media (max-width: 768px) {
    margin-bottom: 60px;
  }

  @media (max-width: 480px) {
    margin-bottom: 50px;
  }

  h3 {
    font-size: 2rem;
    color: #ffffff;
    margin-bottom: 40px;
    text-align: center;
    font-family: "Korsvagen Brand", "Times New Roman", serif;
    font-weight: 400;
    letter-spacing: 0.02em;
    text-transform: uppercase;

    @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 35px;
    }

    @media (max-width: 480px) {
      font-size: 1.6rem;
      margin-bottom: 30px;
    }
  }

  .positions-grid {
    display: grid;
    gap: 25px;
    margin-top: 40px;

    @media (max-width: 768px) {
      gap: 20px;
    }

    .position-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 20px;
      padding: 30px;
      backdrop-filter: blur(10px);
      transition: all 0.3s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-5px);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
      }

      .position-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 20px;
        flex-wrap: wrap;
        gap: 1rem;

        h4 {
          color: #ffffff;
          margin: 0;
          font-family: "Korsvagen Brand", "Times New Roman", serif;
          font-size: 1.4rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          flex: 1;
          min-width: 200px;
        }

        .position-type {
          background: rgba(76, 175, 80, 0.1);
          color: #4caf50;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
          border: 1px solid rgba(76, 175, 80, 0.2);
          font-family: "Inter", "Segoe UI", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          white-space: nowrap;
        }
      }

      .position-details {
        margin-bottom: 20px;

        .detail-item {
          display: flex;
          align-items: center;
          margin-bottom: 12px;
          color: #cccccc;
          font-size: 0.95rem;
          font-family: "Inter", "Segoe UI", sans-serif;

          .icon {
            margin-right: 12px;
            width: 18px;
            color: #4caf50;
          }
        }
      }

      p {
        color: #cccccc;
        line-height: 1.6;
        margin-bottom: 20px;
        font-family: "Inter", "Segoe UI", sans-serif;
      }

      .requirements {
        margin-bottom: 25px;

        h5 {
          color: #ffffff;
          margin-bottom: 15px;
          font-size: 1rem;
          font-weight: 600;
          font-family: "Inter", "Segoe UI", sans-serif;
        }

        ul {
          list-style: none;
          padding: 0;

          li {
            color: #cccccc;
            margin-bottom: 8px;
            font-family: "Inter", "Segoe UI", sans-serif;
            font-size: 0.9rem;
            display: flex;
            align-items: flex-start;

            &::before {
              content: "•";
              color: #4caf50;
              font-weight: bold;
              margin-right: 12px;
              font-size: 1.2rem;
              flex-shrink: 0;
              line-height: 1;
            }
          }
        }
      }

      .salary-range {
        background: linear-gradient(45deg, #4caf50, #66bb6a);
        color: white;
        padding: 8px 16px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.9rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 20px;
      }

      .apply-button {
        background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
        color: white;
        border: none;
        padding: 12px 30px;
        border-radius: 25px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        font-family: "Inter", "Segoe UI", sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        width: 100%;

        &:hover {
          background: linear-gradient(135deg, #45a049 0%, #4caf50 100%);
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
        }
      }
    }
  }
`;

const ApplicationModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  border-radius: 20px;
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
`;

const ModalHeader = styled.div`
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
`;

const ModalTitle = styled.h3`
  margin: 0;
  color: #ffffff;
  font-size: 1.5rem;
  font-family: "Korsvagen Brand", "Times New Roman", serif;
  font-weight: 400;
  letter-spacing: 0.02em;
  flex: 1;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #cccccc;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;

  &:hover {
    color: #ffffff;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const FormContainer = styled.div`
  padding: 2rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #cccccc;
    font-weight: 500;
    font-family: "Inter", "Segoe UI", sans-serif;
    font-size: 1rem;
  }

  .required {
    color: #ff4444;
  }

  input,
  textarea {
    width: 100%;
    padding: 15px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: #ffffff;
    font-family: "Inter", "Segoe UI", sans-serif;
    font-size: 1rem;
    transition: all 0.3s ease;

    &:focus {
      outline: none;
      border-color: #4caf50;
      background: rgba(255, 255, 255, 0.1);
    }

    &::placeholder {
      color: #999999;
    }
  }

  textarea {
    resize: vertical;
    min-height: 120px;
  }

  .file-input-container {
    position: relative;
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 15px;
    border: 2px dashed rgba(255, 255, 255, 0.2);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.02);
    transition: all 0.3s ease;
    cursor: pointer;

    &:hover,
    &.dragover {
      border-color: #4caf50;
      background: rgba(76, 175, 80, 0.1);
    }

    input[type="file"] {
      position: absolute;
      left: -9999px;
      opacity: 0;
    }

    .file-input-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;

      .upload-icon {
        color: #4caf50;
      }

      .file-text {
        flex: 1;

        .file-name {
          color: #ffffff;
          font-weight: 600;
        }

        .file-hint {
          color: #999999;
          font-size: 0.9rem;
        }
      }
    }
  }

  small {
    display: block;
    color: #999999;
    font-size: 0.9rem;
    margin-top: 0.5rem;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 15px 40px;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: "Inter", "Segoe UI", sans-serif;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  width: 100%;

  &:hover {
    background: linear-gradient(135deg, #45a049 0%, #4caf50 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

// Static benefits data
const benefits = [
  {
    icon: "💰",
    title: "Stipendio Competitivo",
    description:
      "Offriamo retribuzioni allineate al mercato con possibilità di crescita economica.",
  },
  {
    icon: "📈",
    title: "Crescita Professionale",
    description:
      "Percorsi di formazione continua e opportunità di avanzamento di carriera.",
  },
  {
    icon: "🏥",
    title: "Assicurazione Sanitaria",
    description: "Copertura sanitaria integrativa per te e la tua famiglia.",
  },
  {
    icon: "⏰",
    title: "Flessibilità",
    description:
      "Orari flessibili e possibilità di smart working dove possibile.",
  },
  {
    icon: "🎯",
    title: "Progetti Stimolanti",
    description:
      "Lavorerai su progetti innovativi e sfidanti nel settore edilizio.",
  },
  {
    icon: "👥",
    title: "Team Affiatato",
    description:
      "Ambiente di lavoro collaborativo con colleghi qualificati e disponibili.",
  },
];

const CareersPage: React.FC = () => {
  const navigate = useNavigate();
  const { slug } = useParams<{ slug?: string }>();
  
  const {
    jobs,
    loading,
    error,
    fetchPublicJobs,
    fetchJobBySlug,
    submitApplication,
    fetchDepartments,
    fetchLocations,
  } = useJobs();

  const [departments, setDepartments] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    department: '',
    location: '',
    employment_type: ''
  });

  const [selectedJob, setSelectedJob] = useState<JobPosition | null>(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationData, setApplicationData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    cover_letter: '',
    linkedin_profile: '',
    portfolio_url: '',
  });
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If viewing specific job by slug
    if (slug) {
      loadJobBySlug(slug);
    } else {
      // Load all public jobs
      loadJobs();
    }
    loadMetadata();
  }, [slug]);

  useEffect(() => {
    if (!slug) {
      loadJobs();
    }
  }, [filters, slug]);

  const loadJobs = async () => {
    try {
      await fetchPublicJobs(filters);
    } catch (err) {
      console.error('Error loading jobs:', err);
    }
  };

  const loadJobBySlug = async (jobSlug: string) => {
    try {
      const job = await fetchJobBySlug(jobSlug);
      if (job) {
        setSelectedJob(job);
        setShowApplicationModal(true);
      } else {
        toast.error('Posizione lavorativa non trovata');
        navigate('/lavora-con-noi');
      }
    } catch (err) {
      console.error('Error loading job by slug:', err);
      toast.error('Errore nel caricamento della posizione');
      navigate('/lavora-con-noi');
    }
  };

  const loadMetadata = async () => {
    try {
      const [depts, locs] = await Promise.all([
        fetchDepartments(),
        fetchLocations(),
      ]);
      setDepartments(depts);
      setLocations(locs);
    } catch (err) {
      console.error('Error loading metadata:', err);
    }
  };

  const handleApplyClick = (job: JobPosition) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    // Update URL without navigation
    window.history.pushState(null, '', `/lavora-con-noi/${job.slug}`);
  };

  const handleCloseModal = () => {
    setSelectedJob(null);
    setShowApplicationModal(false);
    setApplicationData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      cover_letter: '',
      linkedin_profile: '',
      portfolio_url: '',
    });
    setCvFile(null);
    // Update URL without navigation
    window.history.pushState(null, '', '/lavora-con-noi');
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Verify file type
      const allowedTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Formato file non supportato. Si prega di caricare un file PDF o Word.");
        return;
      }
      // Verify file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Il file è troppo grande. Dimensione massima: 5MB.");
        return;
      }
    }
    setCvFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedJob || !cvFile) {
      toast.error('Dati mancanti per l\'invio della candidatura');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      Object.entries(applicationData).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });
      formData.append('cv', cvFile);

      const success = await submitApplication(selectedJob.slug, formData);
      
      if (success) {
        toast.success('Candidatura inviata con successo! Ti contatteremo presto.');
        handleCloseModal();
      }
    } catch (err) {
      toast.error('Errore nell\'invio della candidatura. Riprova più tardi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const parseRequirements = (requirements: string): string[] => {
    return requirements
      .split('\n')
      .filter(req => req.trim())
      .map(req => req.trim());
  };

  const formatSalaryRange = (salary: string): string => {
    return salary.replace(/€\s*/, '€ ').replace(/\s+/g, ' ');
  };

  return (
    <CareersContainer>
      <Header />
      <MainContent>
        <PageHero
          title="Lavora con Noi"
          subtitle="Unisciti al team KORSVAGEN e contribuisci a costruire il futuro dell'edilizia"
          size="compact"
        />

        <ContentSection>
          <Container>
            <IntroSection>
              <h2>Perché Scegliere KORSVAGEN</h2>
              <p>
                In KORSVAGEN crediamo che le persone siano il nostro asset più
                prezioso. Offriamo un ambiente di lavoro stimolante, opportunità
                di crescita professionale e la possibilità di lavorare su
                progetti innovativi che fanno la differenza.
              </p>
            </IntroSection>

            <BenefitsSection>
              <h3>I Nostri Vantaggi</h3>
              <div className="benefits-grid">
                {benefits.map((benefit, index) => (
                  <div key={index} className="benefit-card">
                    <div className="benefit-icon">{benefit.icon}</div>
                    <h4>{benefit.title}</h4>
                    <p>{benefit.description}</p>
                  </div>
                ))}
              </div>
            </BenefitsSection>

            <PositionsSection>
              <h3>Posizioni Aperte</h3>
              
              {/* Filters */}
              {!slug && (
                <FiltersSection>
                  <FilterSelect
                    value={filters.department}
                    onChange={(e) => setFilters({...filters, department: e.target.value})}
                  >
                    <option value="">Tutti i dipartimenti</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </FilterSelect>
                  
                  <FilterSelect
                    value={filters.location}
                    onChange={(e) => setFilters({...filters, location: e.target.value})}
                  >
                    <option value="">Tutte le sedi</option>
                    {locations.map(location => (
                      <option key={location} value={location}>{location}</option>
                    ))}
                  </FilterSelect>
                  
                  <FilterSelect
                    value={filters.employment_type}
                    onChange={(e) => setFilters({...filters, employment_type: e.target.value})}
                  >
                    <option value="">Tutti i contratti</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Stage</option>
                  </FilterSelect>
                </FiltersSection>
              )}

              {loading ? (
                <LoadingContainer>
                  Caricamento posizioni...
                </LoadingContainer>
              ) : error ? (
                <EmptyState>
                  <h3>Errore nel caricamento</h3>
                  <p>Si è verificato un errore nel caricamento delle posizioni. Riprova più tardi.</p>
                </EmptyState>
              ) : jobs.length > 0 ? (
                <div className="positions-grid">
                  {jobs.map((job) => (
                    <div key={job.id} className="position-card">
                      <div className="position-header">
                        <h4>{job.title}</h4>
                        <span className="position-type">{job.employment_type}</span>
                      </div>
                      
                      <div className="position-details">
                        <div className="detail-item">
                          <MapPin className="icon" size={18} />
                          {job.location}
                        </div>
                        <div className="detail-item">
                          <Building className="icon" size={18} />
                          {job.department}
                        </div>
                        <div className="detail-item">
                          <User className="icon" size={18} />
                          {job.experience_level}
                        </div>
                      </div>

                      <p>{job.description}</p>

                      <div className="requirements">
                        <h5>Requisiti:</h5>
                        <ul>
                          {parseRequirements(job.requirements).slice(0, 4).map((req, index) => (
                            <li key={index}>{req}</li>
                          ))}
                          {parseRequirements(job.requirements).length > 4 && (
                            <li>+{parseRequirements(job.requirements).length - 4} altri...</li>
                          )}
                        </ul>
                      </div>

                      {job.salary_range && (
                        <div className="salary-range">
                          <DollarSign size={16} />
                          {formatSalaryRange(job.salary_range)}
                        </div>
                      )}

                      <button
                        className="apply-button"
                        onClick={() => handleApplyClick(job)}
                      >
                        Candidati
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState>
                  <h3>Nessuna posizione disponibile</h3>
                  <p>
                    Al momento non ci sono posizioni aperte. 
                    Torna a trovarci presto per nuove opportunità!
                  </p>
                </EmptyState>
              )}
            </PositionsSection>
          </Container>
        </ContentSection>

        {/* Application Modal */}
        {showApplicationModal && selectedJob && (
          <ApplicationModal onClick={(e) => e.target === e.currentTarget && handleCloseModal()}>
            <ModalContent>
              <ModalHeader>
                <ModalTitle>
                  Candidatura per: {selectedJob.title}
                </ModalTitle>
                <CloseButton onClick={handleCloseModal}>
                  <X size={24} />
                </CloseButton>
              </ModalHeader>

              <FormContainer>
                <form onSubmit={handleSubmit}>
                  <FormRow>
                    <FormGroup>
                      <label>
                        Nome <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="first_name"
                        value={applicationData.first_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Il tuo nome"
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>
                        Cognome <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        name="last_name"
                        value={applicationData.last_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Il tuo cognome"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormRow>
                    <FormGroup>
                      <label>
                        Email <span className="required">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={applicationData.email}
                        onChange={handleInputChange}
                        required
                        placeholder="la.tua@email.com"
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Telefono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={applicationData.phone}
                        onChange={handleInputChange}
                        placeholder="+39 123 456 7890"
                      />
                    </FormGroup>
                  </FormRow>

                  <FormGroup>
                    <label>
                      Curriculum Vitae <span className="required">*</span>
                    </label>
                    <div className="file-input-container">
                      <input
                        type="file"
                        id="cv-upload"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        required
                      />
                      <label htmlFor="cv-upload" className="file-input-content">
                        <Upload className="upload-icon" size={24} />
                        <div className="file-text">
                          {cvFile ? (
                            <div className="file-name">{cvFile.name}</div>
                          ) : (
                            <>
                              <div className="file-name">Seleziona file CV</div>
                              <div className="file-hint">PDF, DOC, DOCX - max 5MB</div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </FormGroup>

                  <FormGroup>
                    <label>Lettera di Presentazione</label>
                    <textarea
                      name="cover_letter"
                      value={applicationData.cover_letter}
                      onChange={handleInputChange}
                      placeholder="Raccontaci di te, delle tue competenze e perché vorresti lavorare con noi..."
                    />
                  </FormGroup>

                  <FormRow>
                    <FormGroup>
                      <label>Profilo LinkedIn</label>
                      <input
                        type="url"
                        name="linkedin_profile"
                        value={applicationData.linkedin_profile}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/tuoprofilo"
                      />
                    </FormGroup>
                    <FormGroup>
                      <label>Portfolio/Sito Web</label>
                      <input
                        type="url"
                        name="portfolio_url"
                        value={applicationData.portfolio_url}
                        onChange={handleInputChange}
                        placeholder="https://tuoportfolio.com"
                      />
                    </FormGroup>
                  </FormRow>

                  <SubmitButton type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Invio in corso...' : 'Invia Candidatura'}
                  </SubmitButton>
                </form>
              </FormContainer>
            </ModalContent>
          </ApplicationModal>
        )}

        <ContactCTA />
      </MainContent>
      <Footer />
    </CareersContainer>
  );
};

export default CareersPage;