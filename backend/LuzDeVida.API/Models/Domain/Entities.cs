namespace LuzDeVida.API.Models.Domain;

public class Safehouse
{
    public int Id { get; set; }
    public string Code { get; set; }
    public string Name { get; set; }
    public string Region { get; set; } // Luzon, Visayas, Mindanao
    public string City { get; set; }
    public string Province { get; set; }
    public string Country { get; set; } = "Philippines";
    public DateTime OpenDate { get; set; }
    public string Status { get; set; } = "Active"; // Active, Inactive
    public int CapacityGirls { get; set; }
    public int CapacityStaff { get; set; }
    public int CurrentOccupancy { get; set; }
    public string? Notes { get; set; }
}

public class Resident
{
    public int Id { get; set; }
    public string CaseControlNo { get; set; }
    public string InternalCode { get; set; }
    public int SafehouseId { get; set; }
    public Safehouse? Safehouse { get; set; }
    
    // Demographics
    public string Sex { get; set; } = "F";
    public DateTime DateOfBirth { get; set; }
    public string BirthStatus { get; set; } // Marital, Non-Marital
    public string PlaceOfBirth { get; set; }
    public string Religion { get; set; }
    
    // Case Info
    public string CaseStatus { get; set; } = "Active"; // Active, Closed, Transferred
    public string CaseCategory { get; set; } // Abandoned, Foundling, Surrendered, Neglected
    
    // Risk Factors (booleans)
    public bool IsOrphaned { get; set; }
    public bool IsTrafficked { get; set; }
    public bool IsChildLabor { get; set; }
    public bool IsPhysicalAbuse { get; set; }
    public bool IsSexualAbuse { get; set; }
    public bool IsCSAEM { get; set; }
    public bool IsCICL { get; set; }
    public bool IsAtRisk { get; set; }
    public bool IsStreetChild { get; set; }
    public bool IsLivingWithHIV { get; set; }
    
    // Disability & Special Needs
    public bool IsPWD { get; set; }
    public string? PWDType { get; set; }
    public bool HasSpecialNeeds { get; set; }
    public string? SpecialNeedsDiagnosis { get; set; }
    
    // Family Info
    public bool Family4PS { get; set; }
    public bool FamilySoloParent { get; set; }
    public bool FamilyIndigenous { get; set; }
    public bool FamilyParentPWD { get; set; }
    public bool FamilyInformalSettler { get; set; }
    
    // Admission
    public DateTime DateOfAdmission { get; set; }
    public string ReferralSource { get; set; } // Government Agency, NGO, Police, etc.
    public string? ReferringAgencyPerson { get; set; }
    public DateTime? DateCOLBRegistered { get; set; }
    public DateTime? DateCOLBObtained { get; set; }
    public string? AssignedSocialWorker { get; set; }
    public string? InitialCaseAssessment { get; set; }
    public DateTime? DateCaseStudyPrepared { get; set; }
    
    // Reintegration
    public string? ReintegrationType { get; set; } // Family Reunification, Foster Care, Adoption, etc.
    public string? ReintegrationStatus { get; set; } // Not Started, In Progress, Completed, On Hold
    
    // Risk Assessment
    public string InitialRiskLevel { get; set; } = "Low"; // Low, Medium, High, Critical
    public string CurrentRiskLevel { get; set; } = "Low";
    
    // Dates
    public DateTime DateEnrolled { get; set; }
    public DateTime? DateClosed { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public string? NotesRestricted { get; set; }
}

public class Supporter
{
    public int Id { get; set; }
    public string SupporterType { get; set; } // MonetaryDonor, InKindDonor, Volunteer, etc.
    public string DisplayName { get; set; }
    public string? OrganizationName { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string RelationshipType { get; set; } // Local, International, PartnerOrganization
    public string Region { get; set; }
    public string Country { get; set; }
    public string? Email { get; set; }
    public string? Phone { get; set; }
    public string Status { get; set; } = "Active";
    public DateTime? FirstDonationDate { get; set; }
    public string? AcquisitionChannel { get; set; } // Website, SocialMedia, Event, etc.
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class Donation
{
    public int Id { get; set; }
    public int SupporterId { get; set; }
    public Supporter? Supporter { get; set; }
    public string DonationType { get; set; } // Monetary, InKind, Time, Skills, SocialMedia
    public DateTime DonationDate { get; set; }
    public string ChannelSource { get; set; }
    public string? CurrencyCode { get; set; } // PHP
    public decimal? Amount { get; set; }
    public decimal? EstimatedValue { get; set; }
    public string? ImpactUnit { get; set; } // pesos, items, hours, campaigns
    public bool IsRecurring { get; set; }
    public string? CampaignName { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class ProcessRecording
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public Resident? Resident { get; set; }
    public DateTime SessionDate { get; set; }
    public string SocialWorker { get; set; }
    public string SessionType { get; set; } // Individual, Group
    public int SessionDurationMinutes { get; set; }
    public string EmotionalStateObserved { get; set; } // Calm, Anxious, Sad, Angry, Hopeful, etc.
    public string? EmotionalStateEnd { get; set; }
    public string SessionNarrative { get; set; }
    public string? InterventionsApplied { get; set; }
    public string? FollowUpActions { get; set; }
    public bool ProgressNoted { get; set; }
    public bool ConcernsFlagged { get; set; }
    public bool ReferralMade { get; set; }
    public string? NotesRestricted { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class HomeVisitation
{
    public int Id { get; set; }
    public int ResidentId { get; set; }
    public Resident? Resident { get; set; }
    public DateTime VisitDate { get; set; }
    public string SocialWorker { get; set; }
    public string VisitType { get; set; } // Initial Assessment, Routine Follow-Up, Reintegration Assessment, etc.
    public string LocationVisited { get; set; }
    public string? FamilyMembersPresent { get; set; }
    public string Purpose { get; set; }
    public string Observations { get; set; }
    public string FamilyCooperationLevel { get; set; } // Highly Cooperative, Cooperative, Neutral, Uncooperative
    public bool SafetyConcernsNoted { get; set; }
    public bool FollowUpNeeded { get; set; }
    public string? FollowUpNotes { get; set; }
    public string VisitOutcome { get; set; } // Favorable, Needs Improvement, Unfavorable, Inconclusive
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
