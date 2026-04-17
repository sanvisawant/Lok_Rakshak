import 'dart:async';
import 'package:suraksha_app/models/models.dart';

class MockService {
  // Simulate GET /trains
  Future<List<TrainModel>> getTrains() async {
    await Future.delayed(const Duration(milliseconds: 800));
    return [
      // Western Line (Focused on Andheri)
      TrainModel(
        id: 'w1',
        name: 'Churchgate Slow',
        number: 'BO-CCV',
        etaMinutes: 2,
        platform: 'PF 1',
        crowdCapacityPercentage: 0.88,
        riskLevel: RiskLevel.high,
        trainType: TrainType.local,
        scheduledTime: '01:30 PM',
        routeTag: 'WESTERN LINE',
      ),
      TrainModel(
        id: 'w2',
        name: 'Virar Fast',
        number: 'VR-900',
        etaMinutes: 7,
        platform: 'PF 3',
        crowdCapacityPercentage: 0.95,
        riskLevel: RiskLevel.high,
        trainType: TrainType.local,
        scheduledTime: '01:35 PM',
        routeTag: 'WESTERN LINE',
      ),
      // Central Line (Focused on Dadar/CSMT)
      TrainModel(
        id: 'c1',
        name: 'Kalyan Fast',
        number: 'KYN-F',
        etaMinutes: 5,
        platform: 'PF 4',
        crowdCapacityPercentage: 0.75,
        riskLevel: RiskLevel.medium,
        trainType: TrainType.local,
        scheduledTime: '01:33 PM',
        routeTag: 'CENTRAL LINE',
      ),
      TrainModel(
        id: 'c2',
        name: 'Kasara Slow',
        number: 'KSRA-S',
        etaMinutes: 12,
        platform: 'PF 2',
        crowdCapacityPercentage: 0.30,
        riskLevel: RiskLevel.low,
        trainType: TrainType.local,
        scheduledTime: '01:40 PM',
        routeTag: 'CENTRAL LINE',
      ),
      // Harbour Line (Focused on Vashi/Panvel)
      TrainModel(
        id: 'h1',
        name: 'Panvel Slow',
        number: 'PNVL',
        etaMinutes: 4,
        platform: 'PF 1',
        crowdCapacityPercentage: 0.82,
        riskLevel: RiskLevel.high,
        trainType: TrainType.local,
        scheduledTime: '01:32 PM',
        routeTag: 'HARBOUR LINE',
      ),
      TrainModel(
        id: 'h2',
        name: 'Belapur Fast',
        number: 'BLPR-F',
        etaMinutes: 9,
        platform: 'PF 2',
        crowdCapacityPercentage: 0.60,
        riskLevel: RiskLevel.medium,
        trainType: TrainType.local,
        scheduledTime: '01:37 PM',
        routeTag: 'HARBOUR LINE',
      ),
      // Intercity
      TrainModel(
        id: '1',
        name: 'Deccan Queen',
        number: '12124',
        etaMinutes: 24,
        platform: 'PF 9',
        crowdCapacityPercentage: 0.92,
        riskLevel: RiskLevel.high,
        trainType: TrainType.intercity,
        scheduledTime: '01:52 PM',
        routeTag: 'INTERCITY',
      ),
      TrainModel(
        id: '5',
        name: 'Siddheshwar Exp',
        number: '12115',
        etaMinutes: 45,
        platform: 'PF 12',
        crowdCapacityPercentage: 0.55,
        riskLevel: RiskLevel.medium,
        trainType: TrainType.intercity,
        scheduledTime: '02:13 PM',
        routeTag: 'INTERCITY',
      ),
    ];
  }

  // Simulate GET /alerts
  Future<List<AlertModel>> getAlerts() async {
    await Future.delayed(const Duration(milliseconds: 500));
    return [
      AlertModel(
        id: 'a1',
        title: 'Extreme Crowd at Dadar Station',
        message: 'Platform 4 and 5 are experiencing dangerously high footfall. Please avoid changing lines at Dadar.',
        type: 'danger',
        timestamp: 'Issued 4 mins ago',
      ),
      AlertModel(
        id: 'a2',
        title: 'Escalator Maintenance: Churchgate',
        message: 'Main north-side escalator under maintenance between 2:00 PM and 4:00 PM.',
        type: 'info',
        timestamp: 'Issued 1 hour ago',
      ),
      AlertModel(
        id: 'a3',
        title: 'Technical Snag: Western Line',
        message: 'Slow trains on the Western line are currently running with a delay of 15-20 minutes.',
        type: 'warning',
        timestamp: 'Issued 2 hours ago',
      ),
    ];
  }

  // Simulate WebSocket Stream for Crowd Updates
  Stream<Map<String, dynamic>> getCrowdUpdates() async* {
    final random = [0.1, 0.5, 0.9, 0.3, 0.7];
    int i = 0;
    while (true) {
      await Future.delayed(const Duration(seconds: 5));
      yield {
        'train_id': '1',
        'coach_id': 'C${(i % 5) + 1}',
        'density': random[i % 5],
      };
      i++;
    }
  }
}
