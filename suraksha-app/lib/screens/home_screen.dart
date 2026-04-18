import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:speech_to_text/speech_to_text.dart' as stt;
import 'package:flutter_tts/flutter_tts.dart';
import 'package:suraksha_app/theme/app_theme.dart';
import 'package:suraksha_app/widgets/safety_widgets.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final stt.SpeechToText _speech = stt.SpeechToText();
  late FlutterTts _flutterTts;
  
  bool _isListening = false;
  String _spokenText = '';
  String _chatbotResponse = 'Hold the mic to speak, or type your report to Veritas AI...';
  String _chatbotStatus = 'Ready';
  bool _isProcessing = false;
  final TextEditingController _textController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _flutterTts = FlutterTts();
    _initSpeech();
  }

  void _initSpeech() async {
    await _speech.initialize();
    setState(() {});
  }

  Future<void> _speak(String text) async {
    await _flutterTts.setLanguage("en-US");
    await _flutterTts.setPitch(1.0);
    await _flutterTts.speak(text);
  }

  void _listen() async {
    if (!_isListening) {
      bool available = await _speech.initialize(
        onStatus: (val) => print('onStatus: $val'),
        onError: (val) => print('onError: $val'),
      );
      if (available) {
        setState(() {
          _isListening = true;
          _chatbotResponse = "Listening...";
        });
        _speech.listen(
          onResult: (val) => setState(() {
            _spokenText = val.recognizedWords;
          }),
        );
      }
    } else {
      setState(() {
        _isListening = false;
        _isProcessing = true;
        _chatbotResponse = "Verifying report...";
      });
      _speech.stop();
      _sendToVeritas(_spokenText);
    }
  }

  Future<void> _sendToVeritas(String text) async {
    if (text.isEmpty) {
      setState(() {
        _isProcessing = false;
        _chatbotResponse = "I didn't catch that. Please try again.";
      });
      return;
    }

    try {
      // Modify this hostname if testing on physical device (e.g., your laptop IP)
      final url = Uri.parse('http://127.0.0.1:8000/api/alerts/veritas');
      final response = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({"text_report": text, "user_id": "FlutterSDKUser"}),
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _chatbotResponse = data['verdict'] ?? "Information Processed.";
          _chatbotStatus = data['status'] == 'VERIFIED' ? 'Verified' : 'Unverified / Fake';
        });
        _speak(_chatbotResponse);
      } else {
        setState(() {
          _chatbotResponse = "Backend Error: Could not verify.";
        });
      }
    } catch (e) {
      setState(() {
        _chatbotResponse = "Connection Error. Operating in fallback mode.";
      });
    } finally {
      setState(() {
        _isProcessing = false;
      });
    }
  }

  Future<void> _triggerSOS() async {
    try {
      final url = Uri.parse('http://127.0.0.1:8000/api/alerts/sos');
      await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          "user_id": "FlutterSDKUser",
          "location": "Live System Node",
          "message": "Immediate SOS triggered from Suraksha SDK"
        }),
      );
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('🚨 SOS SENT! Agencies alerted.'), backgroundColor: AppTheme.accentRed)
      );
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Error sending SOS.'), backgroundColor: Colors.red)
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: CustomScrollView(
        slivers: [
          _buildAppBar(),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 8),
                  const Text(
                    'LOK-RAKSHAK',
                    style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
                  ),
                  const Text(
                    'Safety Overlay',
                    style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(height: 16),
                  
                  const AlertBanner(
                    title: 'SYSTEM ACTIVE',
                    message: 'Your safety is monitored by Lok-Rakshak AI.',
                  ),
                  
                  const SizedBox(height: 24),
                  
                  // Big SOS Button replacing the SafetyInsightCard
                  GestureDetector(
                    onTap: () => _triggerSOS(),
                    child: Container(
                      width: double.infinity,
                      constraints: const BoxConstraints(minHeight: 180),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [AppTheme.accentRed, Color(0xFF991B1B)],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(24),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.accentRed.withOpacity(0.4),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          )
                        ]
                      ),
                      padding: const EdgeInsets.all(24),
                      child: const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.sos, color: Colors.white, size: 48),
                          SizedBox(height: 12),
                          Text(
                            'One-Tap SOS',
                            style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
                          ),
                          SizedBox(height: 8),
                          Text(
                            'Trigger Immediate RPF & NDMA Alert',
                            style: TextStyle(color: Colors.white70, fontSize: 14),
                          ),
                        ],
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: 32),
                  const Text(
                    'VERITAS AI',
                    style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppTheme.primaryNavy),
                  ),
                  const SizedBox(height: 12),
                  
                  // Floating Chatbot UI
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(24),
                      boxShadow: [
                        BoxShadow(
                          color: Colors.black.withOpacity(0.05),
                          blurRadius: 15,
                          offset: const Offset(0, 5)
                        )
                      ]
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.verified_user, color: Colors.blueAccent),
                                const SizedBox(width: 8),
                                Text(
                                  _chatbotStatus,
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: _chatbotStatus == 'Verified' ? Colors.green : Colors.blueAccent
                                  ),
                                ),
                              ],
                            ),
                            if (_isProcessing) 
                              const SizedBox(
                                width: 16, height: 16,
                                child: CircularProgressIndicator(strokeWidth: 2)
                              )
                          ],
                        ),
                        const SizedBox(height: 16),
                        Text(
                          _spokenText.isEmpty ? "Tap mic to report a rumor..." : '"$_spokenText"',
                          style: TextStyle(
                            fontStyle: _spokenText.isEmpty ? FontStyle.normal : FontStyle.italic,
                            color: Colors.black87
                          ),
                        ),
                        const Divider(height: 30),
                        Text(
                          _chatbotResponse,
                          style: const TextStyle(fontSize: 16, color: AppTheme.primaryNavy, fontWeight: FontWeight.w500),
                        ),
                        const SizedBox(height: 24),
                        Row(
                          children: [
                            Expanded(
                              child: TextField(
                                controller: _textController,
                                decoration: InputDecoration(
                                  hintText: "Type report here...",
                                  filled: true,
                                  fillColor: Colors.grey[100],
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(30),
                                    borderSide: BorderSide.none,
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                                ),
                                onSubmitted: (val) {
                                  if (val.trim().isNotEmpty) {
                                    setState(() {
                                      _spokenText = val.trim();
                                      _isProcessing = true;
                                      _chatbotResponse = "Verifying typed report...";
                                    });
                                    _textController.clear();
                                    _sendToVeritas(val.trim());
                                  }
                                },
                              ),
                            ),
                            const SizedBox(width: 8),
                            GestureDetector(
                              onTap: _listen,
                              child: CircleAvatar(
                                radius: 25,
                                backgroundColor: _isListening ? Colors.redAccent : AppTheme.primaryNavy,
                                child: Icon(
                                  _isListening ? Icons.mic_off : Icons.mic, 
                                  color: Colors.white, 
                                  size: 24
                                ),
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Center(
                          child: Text(
                            _isListening ? "Tap to Stop" : "Hold Mic or Press Enter to Send",
                            style: const TextStyle(color: Colors.grey, fontSize: 12),
                          ),
                        )
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: 48), // Bottom padding
                ],
              ),
            ),
          ),
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
            'LOK-RAKSHAK',
            style: TextStyle(fontWeight: FontWeight.w900, color: AppTheme.primaryNavy),
          ),
        ],
      ),
    );
  }
}
