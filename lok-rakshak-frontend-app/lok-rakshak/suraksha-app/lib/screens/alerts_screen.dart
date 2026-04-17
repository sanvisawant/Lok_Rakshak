import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:suraksha_app/models/models.dart';
import 'package:suraksha_app/services/mock_service.dart';
import 'package:suraksha_app/theme/app_theme.dart';

class AlertsScreen extends StatelessWidget {
  const AlertsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final mockService = Provider.of<MockService>(context);

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 8,
                        height: 8,
                        decoration: const BoxDecoration(color: AppTheme.accentRed, shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      const Text(
                        'LIVE BROADCAST CENTER',
                        style: TextStyle(color: Colors.grey, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Active Alerts',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Real-time safety communications from the Central Monitoring Station. Verified information for your daily commute.',
                    style: TextStyle(color: Colors.grey, fontSize: 14, height: 1.4),
                  ),
                  const SizedBox(height: 24),
                ],
              ),
            ),
          ),
          FutureBuilder<List<AlertModel>>(
            future: mockService.getAlerts(),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const SliverFillRemaining(child: Center(child: CircularProgressIndicator()));
              }
              final alerts = snapshot.data ?? [];
              return SliverPadding(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                sliver: SliverList(
                  delegate: SliverChildBuilderDelegate(
                    (context, index) {
                      if (index < alerts.length) {
                        return _buildAlertCard(alerts[index]);
                      } else {
                        return _buildBottomActionCards();
                      }
                    },
                    childCount: alerts.length + 1,
                  ),
                ),
              );
            },
          ),
          const SliverToBoxAdapter(child: SizedBox(height: 40)),
        ],
      ),
    );
  }

  Widget _buildAppBar() {
    return SliverAppBar(
      pinned: true,
      elevation: 0,
      surfaceTintColor: Colors.transparent,
      title: Row(
        children: [
          const Icon(Icons.security, color: AppTheme.primaryNavy),
          const SizedBox(width: 8),
          const Text(
            'SURAKSHA',
            style: TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
          ),
          const Spacer(),
          IconButton(onPressed: () {}, icon: const Icon(Icons.wifi_tethering, color: AppTheme.primaryNavy)),
        ],
      ),
    );
  }

  Widget _buildAlertCard(AlertModel alert) {
    bool isDanger = alert.type == 'danger';
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: isDanger ? AppTheme.accentRed : Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: isDanger ? Colors.white24 : Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            isDanger ? Icons.warning_rounded : Icons.info_outline,
                            size: 14,
                            color: isDanger ? Colors.white : AppTheme.primaryNavy,
                          ),
                          const SizedBox(width: 4),
                          Text(
                            isDanger ? 'CRITICAL WARNING' : 'SAFETY TIP',
                            style: TextStyle(
                              color: isDanger ? Colors.white : AppTheme.primaryNavy,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    Icon(Icons.verified, color: isDanger ? Colors.white70 : AppTheme.primaryNavy, size: 16),
                    const SizedBox(width: 4),
                    Text(
                      'VERIFIED',
                      style: TextStyle(
                        color: isDanger ? Colors.white70 : AppTheme.primaryNavy,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Text(
                  alert.title,
                  style: TextStyle(
                    color: isDanger ? Colors.white : AppTheme.primaryNavy,
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  alert.message,
                  style: TextStyle(
                    color: isDanger ? Colors.white70 : Colors.black87,
                    fontSize: 14,
                    height: 1.4,
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      alert.timestamp ?? 'Just now',
                      style: TextStyle(
                        color: isDanger ? Colors.white60 : Colors.grey,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                    if (isDanger)
                      TextButton(
                        onPressed: () {},
                        child: const Row(
                          children: [
                            Text('VIEW DETAILS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                            Icon(Icons.chevron_right, color: Colors.white),
                          ],
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          if (alert.type == 'warning')
            Container(height: 6, decoration: const BoxDecoration(color: AppTheme.alertOrange)),
        ],
      ),
    );
  }

  Widget _buildBottomActionCards() {
    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _buildThumbnailCard(
                'Station Etiquette',
                'https://images.unsplash.com/photo-1474487585617-9df03da3b4f6?auto=format&fit=crop&w=400',
                'GUIDELINES',
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: _buildThumbnailCard(
                'Live CCTV Access',
                'https://images.unsplash.com/photo-1540339832862-4745508c90ca?auto=format&fit=crop&w=400',
                'WATCH',
              ),
            ),
          ],
        ),
        const SizedBox(height: 20),
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: AppTheme.cardGrey, borderRadius: BorderRadius.circular(12)),
                child: const Icon(Icons.local_hospital, color: AppTheme.primaryNavy),
              ),
              const SizedBox(width: 16),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Emergency Medical Booths', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    Text('GENERAL INFO • VERIFIED', style: TextStyle(color: Colors.grey, fontSize: 10)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildThumbnailCard(String title, String imageUrl, String tag) {
    return Container(
      height: 120,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(16),
        image: DecorationImage(image: NetworkImage(imageUrl), fit: BoxFit.cover),
      ),
      child: Stack(
        children: [
          Container(
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(16),
              gradient: LinearGradient(
                begin: Alignment.bottomCenter,
                end: Alignment.topCenter,
                colors: [Colors.black.withOpacity(0.8), Colors.transparent],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(tag, style: const TextStyle(color: Colors.white70, fontSize: 8, fontWeight: FontWeight.bold)),
                Text(title, style: const TextStyle(color: Colors.white, fontSize: 13, fontWeight: FontWeight.bold)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
