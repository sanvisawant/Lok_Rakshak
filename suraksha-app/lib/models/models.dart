enum TrainType { local, intercity }
enum RiskLevel { low, medium, high }

class TrainModel {
  final String id;
  final String name;
  final String number;
  final int etaMinutes;
  final String platform;
  final double crowdCapacityPercentage;
  final RiskLevel riskLevel;
  final TrainType trainType;
  final String scheduledTime; // e.g., "08:15 AM"
  final String? routeTag; // e.g., "CENTRAL LINE", "AC LOCAL", "EXP"
  final String? source;
  final String? destination;

  TrainModel({
    required this.id,
    required this.name,
    required this.number,
    required this.etaMinutes,
    required this.platform,
    required this.crowdCapacityPercentage,
    required this.riskLevel,
    required this.trainType,
    required this.scheduledTime,
    this.routeTag,
    this.source,
    this.destination,
  });

  factory TrainModel.fromJson(Map<String, dynamic> json) {
    return TrainModel(
      id: json['id'],
      name: json['name'],
      number: json['number'],
      etaMinutes: json['eta_minutes'],
      platform: json['platform'],
      crowdCapacityPercentage: json['crowd_capacity'],
      riskLevel: RiskLevel.values.firstWhere((e) => e.name == json['risk_level']),
      trainType: TrainType.values.firstWhere((e) => e.name == json['train_type']),
      scheduledTime: json['scheduled_time'],
      routeTag: json['route_tag'],
      source: json['source'],
      destination: json['destination'],
    );
  }

}

class AlertModel {
  final String id;
  final String title;
  final String message;
  final String type; // 'warning', 'danger', 'info'
  final String? timestamp;
  final bool isVerified;

  AlertModel({
    required this.id,
    required this.title,
    required this.message,
    required this.type,
    this.timestamp,
    this.isVerified = true,
  });

  factory AlertModel.fromJson(Map<String, dynamic> json) {
    return AlertModel(
      id: json['id'],
      title: json['title'],
      message: json['message'],
      type: json['type'],
      timestamp: json['timestamp'],
      isVerified: json['is_verified'] ?? true,
    );
  }
}

class CoachDensity {
  final String coachId;
  final double density; // 0.0 to 1.0

  CoachDensity({required this.coachId, required this.density});
}
