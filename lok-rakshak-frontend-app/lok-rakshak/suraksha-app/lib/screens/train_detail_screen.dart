import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:suraksha_app/models/models.dart';
import 'package:suraksha_app/services/mock_service.dart';
import 'package:suraksha_app/theme/app_theme.dart';

class TrainDetailScreen extends StatelessWidget {
  final TrainModel train;

  const TrainDetailScreen({super.key, required this.train});

  @override
  Widget build(BuildContext context) {
    final mockService = Provider.of<MockService>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(context),
          SliverToBoxAdapter(
            child: Column(
              children: [
                _buildDangerZoneBanner(),
                _buildHeader(),
                _buildCrowdDensitySection(mockService),
                _buildSOSButton(),
                _buildStationMapSection(),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildAppBar(BuildContext context) {
    return SliverAppBar(
      pinned: true,
      backgroundColor: Colors.white,
      leading: IconButton(
        icon: const Icon(Icons.arrow_back, color: AppTheme.primaryNavy),
        onPressed: () => Navigator.pop(context),
      ),
      title: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.security, color: AppTheme.primaryNavy),
          const SizedBox(width: 8),
          const Text(
            'SURAKSHA',
            style: TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
          ),
          const Spacer(flex: 2),
        ],
      ),
      actions: [
        IconButton(onPressed: () {}, icon: const Icon(Icons.wifi_tethering, color: AppTheme.primaryNavy)),
      ],
    );
  }

  Widget _buildDangerZoneBanner() {
    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.accentRed.withAlpha(51)), // 0.2 * 255
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(color: AppTheme.accentRed.withAlpha(26), shape: BoxShape.circle), // 0.1 * 255
            child: const Icon(Icons.warning_amber_rounded, color: AppTheme.accentRed),
          ),
          const SizedBox(width: 16),
          const Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text('DANGER ZONE ALERT', style: TextStyle(color: AppTheme.accentRed, fontWeight: FontWeight.bold, fontSize: 12)),
                    Text('Just now', style: TextStyle(color: Colors.grey, fontSize: 10)),
                  ],
                ),
                SizedBox(height: 4),
                Text(
                  'Increased activity reported in Coach 4. Commuters advised to move to Coach 7 or 8 for safety.',
                  style: TextStyle(fontSize: 12, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(4)),
            child: const Text('LIVE STATUS', style: TextStyle(color: AppTheme.alertOrange, fontWeight: FontWeight.bold, fontSize: 10)),
          ),
          const SizedBox(height: 12),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Text(
                  '${train.number} ${train.name}',
                  style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                ),
              ),
              const Text('07:45', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
            ],
          ),
          const SizedBox(height: 8),
          Row(
            children: [
              const Icon(Icons.location_on, color: Colors.grey, size: 16),
              const SizedBox(width: 4),
              Text(
                'Approaching Andheri • Platform ${train.platform}',
                style: const TextStyle(color: Colors.grey, fontSize: 14),
              ),
              const Spacer(),
              const Text('ARRIVAL', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildCrowdDensitySection(MockService service) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.grey.shade50, borderRadius: BorderRadius.circular(20)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              Icon(Icons.directions_train, size: 16, color: AppTheme.primaryNavy),
              SizedBox(width: 8),
              Text('LIVE CROWD DENSITY (C1-C12)', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12, color: AppTheme.primaryNavy)),
            ],
          ),
          const SizedBox(height: 20),
          StreamBuilder<Map<String, dynamic>>(
            stream: service.getCrowdUpdates(),
            builder: (context, snapshot) {
              // Simulated coach data
              final List<double> densities = [0.1, 0.4, 0.5, 0.9, 0.6];
              return SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: [
                    Container(
                      width: 60,
                      height: 60,
                      decoration: BoxDecoration(color: AppTheme.primaryNavy, borderRadius: BorderRadius.circular(8)),
                      child: const Icon(Icons.train, color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    ...List.generate(densities.length, (index) {
                      final density = densities[index];
                      Color color = AppTheme.safeGreen;
                      if (density > 0.8) {
                        color = AppTheme.accentRed;
                      } else if (density > 0.4) {
                        color = AppTheme.alertOrange;
                      }

                      final isFlash = density > 0.8; // Blinking effect for overcrowded

                      return Container(
                        width: 60,
                        height: 60,
                        margin: const EdgeInsets.only(right: 8),
                        decoration: BoxDecoration(
                          color: color,
                          borderRadius: BorderRadius.circular(8),
                          border: isFlash ? Border.all(color: Colors.white, width: 2) : null,
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Text('C${index + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 10)),
                            const Icon(Icons.person, color: Colors.white, size: 16),
                          ],
                        ),
                      );
                    }),
                  ],
                ),
              );
            },
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _buildLegendItem(AppTheme.safeGreen, 'LOW DENSITY'),
              const SizedBox(width: 16),
              _buildLegendItem(AppTheme.alertOrange, 'MEDIUM'),
              const SizedBox(width: 16),
              _buildLegendItem(AppTheme.accentRed, 'OVERCROWDED'),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLegendItem(Color color, String label) {
    return Row(
      children: [
        Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
        const SizedBox(width: 4),
        Text(label, style: const TextStyle(fontSize: 8, fontWeight: FontWeight.bold, color: Colors.grey)),
      ],
    );
  }

  Widget _buildSOSButton() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: SizedBox(
        width: double.infinity,
        height: 64,
        child: ElevatedButton(
          onPressed: () {},
          style: ElevatedButton.styleFrom(
            backgroundColor: AppTheme.accentRed,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(32)),
          ),
          child: const Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('SOS EMERGENCY HELP', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 18)),
              Text('INSTANT CONNECTION TO RAILWAY POLICE (RPF)', style: TextStyle(color: Colors.white70, fontSize: 8)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStationMapSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Andheri Station Map', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy)),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(4)),
                child: const Text('PLATFORM 2', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Container(
            height: 300,
            decoration: BoxDecoration(borderRadius: BorderRadius.circular(24), border: Border.all(color: Colors.grey.shade300)),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                children: [
                  FlutterMap(
                    options: MapOptions(
                      initialCenter: LatLng(19.1197, 72.8468), // Andheri coords
                      initialZoom: 17,
                    ),
                    children: [
                      TileLayer(
                        urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                        userAgentPackageName: 'com.suraksha.suraksha_app',
                      ),
                      MarkerLayer(
                        markers: [
                          Marker(
                            point: LatLng(19.1197, 72.8468),
                            child: const Icon(Icons.location_on, color: AppTheme.accentRed, size: 40),
                          ),
                        ],
                      ),
                    ],
                  ),
                  Positioned(
                    bottom: 16,
                    left: 16,
                    right: 16,
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                      child: Row(
                        children: [
                          const Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text('SAFE EXIT NEARBY', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppTheme.safeGreen)),
                                Text('Main Overpass - 45m ahead', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              ],
                            ),
                          ),
                          ElevatedButton(
                            onPressed: () {},
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppTheme.primaryNavy,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            child: const Text('GUIDE ME', style: TextStyle(color: Colors.white)),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
